import type { GameModeId } from '~/types/game'
import type { Country } from '~/types/quiz'
import { maskCountryNameHint, normalizeAnswer } from '~/utils/text'
import { useCountries } from './useCountries'

export type GameState = 'guessing' | 'bonus' | 'wrong_pending' | 'failed'

const FAIL_OVERLAY_DELAY_MS = 800

/** Flags you aim to clear in one streak (shown on fail as progress). */
export const RUN_TARGET_FLAGS = 10

const LS_BEST = 'gf-best-streak'
const LS_SCORE = 'gf-total-score'
const LS_HINTS_BANK = 'gf-hints-bank'
const LS_ROUNDS_DONE = 'gf-rounds-done'
const LS_GAME_MODE = 'gf-game-mode'

const CHEERS = [
  'Nice!',
  "You're on fire!",
  'Crushed it!',
  'Got damn...',
  'Solid',
  'Nailed it.',
  'Spot on',
  'Locked in 👽',
  'LETS GOOOOO',
  'U r cracked'
]

/** 1.0 (slow) … 2.0 (instant), linear by elapsed time up to `fullSlowMs`. */
function speedMultiplier(elapsedMs: number, fullSlowMs: number): number {
  const t = Math.min(fullSlowMs, Math.max(0, elapsedMs))
  return 1 + (fullSlowMs - t) / fullSlowMs
}

export function useGame() {
  const { countries, ready } = useCountries()
  const { recordScore, tryRecordMarathonBest } = useLeaderboard()

  const recentIds = useState<string[]>('game-recent-ids', () => [])

  const currentCountry = shallowRef<Country | null>(null)
  const guess = ref('')
  const capitalGuess = ref('')
  const streak = ref(0)
  const bestStreak = ref(0)
  const score = ref(0)
  const gameState = ref<GameState>('guessing')

  const flagSuccess = ref(false)
  const wrongShake = ref(false)
  const wrongCapitalShake = ref(false)
  /** Input shake amplitude (px) when country guess is wrong; scales with flags correct this run. */
  const wrongShakeAmplitudePx = ref(6)
  /** Whole-viewport shake during wrong answer. */
  const screenShakeActive = ref(false)
  const screenShakePx = ref(8)
  const screenShakeDurationMs = ref(600)
  const wrongShakeDurationMs = ref(550)
  const microcopy = ref('')
  const hintsBank = ref(0)
  const roundsFinished = ref(0)
  const flagHintStage = ref(0)
  const capitalHintStage = ref(0)
  const bonusAdvancing = ref(false)

  const roundStartMs = ref(0)
  const bonusStartMs = ref(0)
  const flagsGuessedThisRun = ref(0)

  const failOverlayTimerId = ref<ReturnType<typeof setTimeout> | null>(null)
  const gameMode = useState<GameModeId>('gf-game-mode', () => 'one-life')
  const marathonWrongMessage = ref('')
  const marathonCooldown = ref(false)
  const marathonWrongTimerId = ref<ReturnType<typeof setTimeout> | null>(null)
  /** Shown after a correct capital guess; speed-based bonus points only (streak is unchanged). */
  const capitalSpeedBonusPts = ref<number | null>(null)

  const playSessionActive = useState<boolean>('gf-play-session-active', () => false)

  const failSnapshot = ref<{
    guessed: number
    target: number
    left: number
    score: number
    rank: number
    total: number
    answerName: string
  } | null>(null)

  function loadPersisted() {
    if (!import.meta.client) return
    bestStreak.value = Number(localStorage.getItem(LS_BEST) ?? '0') || 0
    score.value = Number(localStorage.getItem(LS_SCORE) ?? '0') || 0
    const rawHints = localStorage.getItem(LS_HINTS_BANK)
    hintsBank.value =
      rawHints === null || rawHints === ''
        ? 3
        : Math.min(3, Math.max(0, Number(rawHints) || 0))
    roundsFinished.value = Math.max(0, Number(localStorage.getItem(LS_ROUNDS_DONE) ?? '0') || 0)
    const rm = localStorage.getItem(LS_GAME_MODE)
    if (rm === 'one-life' || rm === 'marathon') gameMode.value = rm
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(LS_BEST, String(bestStreak.value))
    localStorage.setItem(LS_SCORE, String(score.value))
  }

  function persistHints() {
    if (!import.meta.client) return
    localStorage.setItem(LS_HINTS_BANK, String(hintsBank.value))
    localStorage.setItem(LS_ROUNDS_DONE, String(roundsFinished.value))
  }

  if (import.meta.client) {
    loadPersisted()
  }

  function grantHintEveryThreeRounds() {
    roundsFinished.value += 1
    if (roundsFinished.value % 3 === 0) {
      hintsBank.value = Math.min(3, hintsBank.value + 1)
    }
    persistHints()
  }

  const roundsUntilNextHint = computed(() => {
    const n = roundsFinished.value
    const mod = n % 3
    if (mod === 0) return n === 0 ? 3 : 3
    return 3 - mod
  })

  function randomCheer() {
    microcopy.value = CHEERS[Math.floor(Math.random() * CHEERS.length)] ?? 'Nice!'
  }

  function pickRandom(): Country | null {
    const list = countries.value
    if (!list.length) return null
    const pool = list.filter((c) => !recentIds.value.includes(c.id))
    const src = pool.length ? pool : list
    const pick = src[Math.floor(Math.random() * src.length)]!
    recentIds.value = [pick.id, ...recentIds.value.filter((x) => x !== pick.id)].slice(0, 30)
    return pick
  }

  function resetHintsForNewRun() {
    hintsBank.value = 3
    persistHints()
  }

  function clearMarathonWrongTimer() {
    if (marathonWrongTimerId.value !== null) {
      clearTimeout(marathonWrongTimerId.value)
      marathonWrongTimerId.value = null
    }
  }

  function bumpMarathonLeader() {
    if (gameMode.value === 'marathon') tryRecordMarathonBest(score.value)
  }

  function applyFullSessionReset(mode: GameModeId) {
    clearFailOverlayTimer()
    clearMarathonWrongTimer()
    failSnapshot.value = null
    marathonCooldown.value = false
    marathonWrongMessage.value = ''
    bonusAdvancing.value = false
    gameState.value = 'guessing'
    gameMode.value = mode
    if (import.meta.client) localStorage.setItem(LS_GAME_MODE, mode)
    score.value = 0
    streak.value = 0
    flagsGuessedThisRun.value = 0
    roundsFinished.value = 0
    resetHintsForNewRun()
    persist()
    currentCountry.value = null
  }

  function setGameMode(mode: GameModeId) {
    if (mode === gameMode.value) return
    applyFullSessionReset(mode)
  }

  function startPlayFromMenu(mode: GameModeId) {
    applyFullSessionReset(mode)
    playSessionActive.value = true
    return navigateTo('/play')
  }

  function exitToMenu() {
    playSessionActive.value = false
    clearFailOverlayTimer()
    clearMarathonWrongTimer()
    failSnapshot.value = null
    marathonCooldown.value = false
    marathonWrongMessage.value = ''
    bonusAdvancing.value = false
    gameState.value = 'guessing'
    currentCountry.value = null
    return navigateTo('/')
  }

  function exitToLeaderboard() {
    playSessionActive.value = false
    clearFailOverlayTimer()
    clearMarathonWrongTimer()
    failSnapshot.value = null
    marathonCooldown.value = false
    marathonWrongMessage.value = ''
    bonusAdvancing.value = false
    gameState.value = 'guessing'
    currentCountry.value = null
    return navigateTo('/leaderboard')
  }

  const canChangeGameMode = computed(
    () => gameState.value === 'guessing' && !marathonCooldown.value && !bonusAdvancing.value
  )

  function startNewRound() {
    if (currentCountry.value) {
      grantHintEveryThreeRounds()
    }
    currentCountry.value = pickRandom()
    guess.value = ''
    capitalGuess.value = ''
    gameState.value = 'guessing'
    flagSuccess.value = false
    microcopy.value = ''
    capitalSpeedBonusPts.value = null
    marathonWrongMessage.value = ''
    flagHintStage.value = 0
    capitalHintStage.value = 0
    roundStartMs.value = Date.now()
  }

  function skipRound() {
    clearFailOverlayTimer()
    clearMarathonWrongTimer()
    marathonCooldown.value = false
    marathonWrongMessage.value = ''
    if (gameState.value === 'wrong_pending') {
      failSnapshot.value = null
      gameState.value = 'guessing'
    }
    streak.value = 0
    persist()
    startNewRound()
  }

  function playAgainAfterFail() {
    clearFailOverlayTimer()
    failSnapshot.value = null
    flagsGuessedThisRun.value = 0
    resetHintsForNewRun()
    gameState.value = 'guessing'
    startNewRound()
  }

  function countryMatches(input: string): boolean {
    const c = currentCountry.value
    if (!c) return false
    return normalizeAnswer(input) === normalizeAnswer(c.name)
  }

  function capitalMatchesRaw(input: string): boolean {
    const c = currentCountry.value
    if (!c) return false
    return normalizeAnswer(input) === normalizeAnswer(c.capital)
  }

  const hintDisplay = computed(() => {
    const c = currentCountry.value
    if (!c || flagHintStage.value === 0) return ''
    return maskCountryNameHint(c.name, flagHintStage.value === 1 ? 1 : 2)
  })

  const capitalHintDisplay = computed(() => {
    const c = currentCountry.value
    if (!c || capitalHintStage.value === 0) return ''
    return maskCountryNameHint(c.capital, capitalHintStage.value === 1 ? 1 : 2)
  })

  const flagHintsDisabled = computed(
    () =>
      gameState.value !== 'guessing' ||
      !currentCountry.value ||
      flagHintStage.value >= 2 ||
      hintsBank.value <= 0
  )

  const capitalHintsDisabled = computed(
    () =>
      gameState.value !== 'bonus' ||
      !currentCountry.value ||
      capitalHintStage.value >= 2 ||
      hintsBank.value <= 0
  )

  function takeFlagHint() {
    if (flagHintsDisabled.value) return
    hintsBank.value -= 1
    flagHintStage.value += 1
    persistHints()
  }

  function takeCapitalHint() {
    if (capitalHintsDisabled.value) return
    hintsBank.value -= 1
    capitalHintStage.value += 1
    persistHints()
  }

  function hintStockLabel() {
    const b = hintsBank.value

    return `${b}`
  }

  const flagHintButtonLabel = computed(() => {
    if (flagHintStage.value >= 2) return 'Name hints used'
    return `Hint  (${hintStockLabel()})`
  })

  const capitalHintButtonLabel = computed(() => {
    if (capitalHintStage.value >= 2) return 'Capital hints used'
    return `Hint · ${hintStockLabel()}`
  })

  async function fireConfetti() {
    if (!import.meta.client) return
    const { default: confetti } = await import('canvas-confetti')
    const tilt = (Math.random() - 0.5) * 0.15
    confetti({
      particleCount: 100 + Math.floor(Math.random() * 50),
      spread: 62 + Math.floor(Math.random() * 18),
      origin: { x: 0.5 + tilt, y: 0.4 },
      scalar: 1.05,
      ticks: 220
    })
  }

  async function resolveFlagCorrect() {
    const elapsed = Date.now() - roundStartMs.value
    const mult = speedMultiplier(elapsed, 20_000)
    const pts = Math.round(10 * mult)

    await new Promise((r) => setTimeout(r, 220 + Math.random() * 140))

    flagSuccess.value = true
    gameState.value = 'bonus'
    bonusStartMs.value = Date.now()

    score.value += pts
    streak.value += 1
    if (streak.value > bestStreak.value) {
      bestStreak.value = streak.value
    }

    flagsGuessedThisRun.value += 1
    if (flagsGuessedThisRun.value >= RUN_TARGET_FLAGS) {
      score.value += 50
      flagsGuessedThisRun.value = 0
      randomCheer()
      microcopy.value = 'Run cleared — +50 bonus!'
    } else {
      randomCheer()
    }

    persist()
    bumpMarathonLeader()
    await fireConfetti()
  }

  function submitFlag() {
    if (gameState.value !== 'guessing' || !currentCountry.value || marathonCooldown.value) return
    if (!countryMatches(guess.value)) {
      const c = currentCountry.value
      const guessed = flagsGuessedThisRun.value
      const { inputPx, screenPx, durationMs } = shakeStrengthFromGuesses(guessed)

      wrongShakeAmplitudePx.value = inputPx
      wrongShakeDurationMs.value = durationMs
      wrongShake.value = true
      window.setTimeout(() => {
        wrongShake.value = false
      }, durationMs)

      screenShakePx.value = screenPx
      screenShakeDurationMs.value = durationMs
      screenShakeActive.value = true
      window.setTimeout(() => {
        screenShakeActive.value = false
        screenShakePx.value = 8
      }, durationMs)

      streak.value = 0
      persist()

      if (gameMode.value === 'marathon') {
        flagsGuessedThisRun.value = 0
        marathonWrongMessage.value = `Not quite — it was ${c.name}.`
        marathonCooldown.value = true
        clearMarathonWrongTimer()
        marathonWrongTimerId.value = window.setTimeout(() => {
          marathonWrongTimerId.value = null
          marathonCooldown.value = false
          marathonWrongMessage.value = ''
          startNewRound()
        }, 1000)
        return
      }

      const finalScore = score.value
      const { rank, total } = recordScore(finalScore, 'one-life')

      score.value = 0
      persist()

      const payload = {
        guessed,
        target: RUN_TARGET_FLAGS,
        left: Math.max(0, RUN_TARGET_FLAGS - guessed),
        score: finalScore,
        rank,
        total,
        answerName: c.name
      }

      clearFailOverlayTimer()
      gameState.value = 'wrong_pending'
      failSnapshot.value = null

      failOverlayTimerId.value = window.setTimeout(() => {
        failOverlayTimerId.value = null
        failSnapshot.value = payload
        gameState.value = 'failed'
      }, FAIL_OVERLAY_DELAY_MS)
      return
    }
    void resolveFlagCorrect()
  }

  async function awardCapitalBonus() {
    const elapsed = Date.now() - bonusStartMs.value
    const mult = speedMultiplier(elapsed, 25_000)
    const pts = Math.round(15 * mult)

    await new Promise((r) => setTimeout(r, 160 + Math.random() * 120))
    score.value += pts
    capitalSpeedBonusPts.value = pts
    randomCheer()
    persist()
    bumpMarathonLeader()
    await fireConfetti()
  }

  async function finishBonusRound() {
    if (gameState.value !== 'bonus' || !currentCountry.value || bonusAdvancing.value) return
    bonusAdvancing.value = true
    try {
      const trimmed = capitalGuess.value.trim()
      if (trimmed && capitalMatchesRaw(trimmed)) {
        await awardCapitalBonus()
        await new Promise((r) => setTimeout(r, 1650))
      } else if (trimmed) {
        wrongCapitalShake.value = true
        await new Promise((r) => window.setTimeout(r, 500))
        wrongCapitalShake.value = false
      }
      startNewRound()
    } finally {
      bonusAdvancing.value = false
    }
  }

  async function primaryAction() {
    if (gameState.value === 'guessing') {
      submitFlag()
      return
    }
    if (gameState.value === 'bonus') {
      await finishBonusRound()
    }
  }

  const primaryLabel = computed(() => {
    switch (gameState.value) {
      case 'guessing':
      case 'wrong_pending':
        return 'Guess'
      case 'bonus':
        return 'Next'
      default:
        return 'Continue'
    }
  })

  const primaryDisabled = computed(
    () =>
      marathonCooldown.value ||
      gameState.value === 'wrong_pending' ||
      (gameState.value === 'guessing' && !guess.value.trim()) ||
      bonusAdvancing.value
  )

  function clearFailOverlayTimer() {
    if (failOverlayTimerId.value !== null) {
      clearTimeout(failOverlayTimerId.value)
      failOverlayTimerId.value = null
    }
  }

  function shakeStrengthFromGuesses(guessed: number) {
    const g = Math.max(0, guessed)
    return {
      inputPx: Math.min(22, 4 + g * 2.2),
      screenPx: Math.min(26, 5 + g * 2.8),
      durationMs: Math.min(750, 420 + g * 32)
    }
  }

  watchEffect(() => {
    if (!playSessionActive.value) return
    if (
      ready.value &&
      !currentCountry.value &&
      gameState.value !== 'failed' &&
      gameState.value !== 'wrong_pending' &&
      !marathonCooldown.value
    ) {
      startNewRound()
    }
  })

  onUnmounted(() => {
    clearFailOverlayTimer()
    clearMarathonWrongTimer()
  })

  return {
    countries,
    ready,
    currentCountry,
    guess,
    capitalGuess,
    streak,
    bestStreak,
    score,
    gameState,
    flagSuccess,
    wrongShake,
    capitalSpeedBonusPts,
    wrongShakeAmplitudePx,
    screenShakeActive,
    screenShakePx,
    screenShakeDurationMs,
    wrongShakeDurationMs,
    wrongCapitalShake,
    microcopy,
    submitFlag,
    skipRound,
    playAgainAfterFail,
    takeFlagHint,
    takeCapitalHint,
    hintsBank,
    roundsUntilNextHint,
    flagHintsDisabled,
    capitalHintsDisabled,
    hintDisplay,
    capitalHintDisplay,
    flagHintButtonLabel,
    capitalHintButtonLabel,
    primaryAction,
    primaryLabel,
    primaryDisabled,
    failSnapshot,
    RUN_TARGET_FLAGS,
    flagsGuessedThisRun,
    gameMode,
    setGameMode,
    canChangeGameMode,
    marathonWrongMessage,
    marathonCooldown,
    startPlayFromMenu,
    exitToMenu,
    exitToLeaderboard
  }
}
