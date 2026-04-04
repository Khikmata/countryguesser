<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'play-session'
})

useHead({
  title: 'Play — Guess the Flag',
  meta: [{ name: 'description', content: 'Name the country, then the capital.' }]
})

const {
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
  wrongShakeAmplitudePx,
  wrongShakeDurationMs,
  screenShakeActive,
  screenShakePx,
  screenShakeDurationMs,
  wrongCapitalShake,
  microcopy,
  capitalSpeedBonusPts,
  submitFlag,
  skipRound,
  playAgainAfterFail,
  takeFlagHint,
  takeCapitalHint,
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
  gameMode,
  marathonWrongMessage,
  marathonCooldown,
  exitToMenu,
  exitToLeaderboard
} = useGame()

const leaderboardWarnOpen = ref(false)

function openLeaderboardWarning() {
  leaderboardWarnOpen.value = true
}

function confirmLeaveForLeaderboard(close: () => void) {
  close()
  void exitToLeaderboard()
}

const flagCelebrate = computed(() => flagSuccess.value || gameState.value === 'bonus')

const flagInputLocked = computed(() => gameState.value !== 'guessing')

const flagInputSuccess = computed(() => flagSuccess.value || gameState.value === 'bonus')

const capitalDisabled = computed(() => gameState.value !== 'bonus')

const showSkip = computed(
  () =>
    gameMode.value === 'marathon' &&
    gameState.value !== 'bonus' &&
    gameState.value !== 'wrong_pending' &&
    !marathonCooldown.value
)

const showGame = computed(
  () => ready.value && currentCountry.value && gameState.value !== 'failed'
)

const screenShakeStyle = computed(() =>
  screenShakeActive.value
    ? ({
        '--sk': `${screenShakePx.value}px`,
        '--sk-dur': `${screenShakeDurationMs.value}ms`
      } as Record<string, string>)
    : undefined
)

const modeLabel = computed(() => (gameMode.value === 'marathon' ? 'Marathon' : 'One life'))
</script>

<template>
  <div
    class="relative min-h-dvh overflow-x-hidden bg-gradient-to-b from-sky-50 via-white to-emerald-50/80 text-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-950/40 dark:text-white"
    :class="screenShakeActive ? 'animate-screen-shake' : ''"
    :style="screenShakeStyle"
  >
    <ClientOnly>
      <FailScreen
        v-if="gameState === 'failed' && failSnapshot"
        :guessed-flags="failSnapshot.guessed"
        :run-target="failSnapshot.target"
        :flags-left="failSnapshot.left"
        :final-score="failSnapshot.score"
        :rank="failSnapshot.rank"
        :leaderboard-total="failSnapshot.total"
        :answer-name="failSnapshot.answerName"
        @play-again="playAgainAfterFail()"
      />
    </ClientOnly>

    <div v-if="gameState !== 'failed'">
      <main
        class="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col items-center overflow-visible px-5 pb-36 pt-10 md:max-w-2xl md:px-8 md:pt-14"
      >
        <div class="flex w-full flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            class="text-sm font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-300"
            @click="exitToMenu()"
          >
            ← Change mode
          </button>
          <span
            class="rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-800 dark:border-violet-500/30 dark:bg-violet-950/40 dark:text-violet-200"
          >
            {{ modeLabel }}
          </span>
        </div>

        <p class="mt-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
          World flags
        </p>
        <h1 class="mt-2 text-center text-4xl font-extrabold tracking-tight md:text-5xl">Guess the flag</h1>

        <ClientOnly>
          <div v-if="!ready" class="mt-16 flex flex-col items-center gap-3 text-neutral-500">
            <UIcon name="i-lucide-loader-2" class="size-12 animate-spin text-emerald-500" />
            <p>Loading flags from around the world…</p>
          </div>
          <div v-else-if="showGame" class="mt-10 flex w-full flex-col items-center gap-8">
            <Transition
              mode="out-in"
              enter-active-class="transition duration-[400ms] ease-out"
              enter-from-class="opacity-0 translate-y-4 scale-[0.97]"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-300 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0 -translate-y-3 scale-[0.98]"
            >
              <FlagDisplay
                :key="currentCountry!.id"
                :src="currentCountry!.flagSvg"
                alt="Flag of a mystery country — can you name it?"
                :celebrate="flagCelebrate"
              />
            </Transition>

            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
            >
              <p
                v-if="marathonWrongMessage && gameMode === 'marathon'"
                class="text-center text-lg font-bold text-amber-700 dark:text-amber-400"
              >
                {{ marathonWrongMessage }}
              </p>
            </Transition>

            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
            >
              <div
                v-if="(microcopy || capitalSpeedBonusPts != null) && gameState === 'bonus'"
                class="flex w-full max-w-md flex-col items-center gap-1 text-center"
              >
                <p v-if="microcopy" class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {{ microcopy }}
                </p>
                <p
                  v-if="capitalSpeedBonusPts != null"
                  class="text-lg font-bold tabular-nums text-amber-700 dark:text-amber-300"
                >
                  Capital speed bonus: +{{ capitalSpeedBonusPts }} pts
                </p>
              </div>
            </Transition>

            <div class="flex w-full max-w-md flex-col items-center gap-4 overflow-visible">
              <template v-if="gameState === 'guessing' || gameState === 'bonus' || gameState === 'wrong_pending'">
                <p class="text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  Which country is it?
                </p>
                <AutocompleteInput
                  v-model="guess"
                  :countries="countries"
                  field="name"
                  :disabled="flagInputLocked"
                  :success="flagInputSuccess"
                  :shake="wrongShake"
                  :shake-amplitude-px="wrongShakeAmplitudePx"
                  :shake-duration-ms="wrongShakeDurationMs"
                  placeholder="Start typing…"
                  aria-label="Country guess"
                  @submit="submitFlag()"
                />

                <div v-if="gameState === 'guessing'" class="flex w-full flex-col items-center gap-2">
                  <UButton
                    size="md"
                    variant="soft"
                    color="amber"
                    class="font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="flagHintsDisabled"
                    aria-label="Spend one saved hint to reveal part of the country name"
                    @click="takeFlagHint()"
                  >
                    {{ flagHintButtonLabel }}
                  </UButton>
                  <p
                    v-if="hintDisplay"
                    class="w-full rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-center font-mono text-sm tracking-wide text-amber-950 dark:border-amber-500/25 dark:bg-amber-950/30 dark:text-amber-100"
                  >
                    {{ hintDisplay }}
                  </p>
                </div>
              </template>

              <Transition
                enter-active-class="transition duration-400 ease-out"
                enter-from-class="translate-y-2 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="translate-y-1 opacity-0"
              >
                <div v-if="gameState === 'bonus'" class="relative z-20 w-full overflow-visible pt-2">
                  <BonusQuestion
                    v-model="capitalGuess"
                    :country-name="currentCountry!.name"
                    :countries="countries"
                    :disabled="capitalDisabled"
                    :shake="wrongCapitalShake"
                    :capital-hint-display="capitalHintDisplay"
                    :capital-hint-disabled="capitalHintsDisabled"
                    :capital-hint-label="capitalHintButtonLabel"
                    @hint="takeCapitalHint()"
                    @submit="primaryAction()"
                  />
                </div>
              </Transition>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
              <UButton
                size="xl"
                class="min-w-[12rem] font-bold shadow-lg transition hover:scale-[1.03] active:scale-[0.97]"
                :disabled="primaryDisabled"
                @click="primaryAction()"
              >
                {{ primaryLabel }}
              </UButton>
              <UButton
                v-if="showSkip"
                size="lg"
                variant="ghost"
                color="neutral"
                class="cursor-pointer font-medium text-neutral-600 underline-offset-4 hover:underline dark:text-neutral-300"
                @click="skipRound()"
              >
                Skip this one
              </UButton>
            </div>
          </div>
        </ClientOnly>

        <ScoreBoard
          v-if="ready && gameState !== 'failed' && gameState !== 'wrong_pending'"
          :streak="streak"
          :best-streak="bestStreak"
          :score="score"
          @leaderboards="openLeaderboardWarning()"
        />

        <UModal
          v-model:open="leaderboardWarnOpen"
          title="Leave this run?"
          description="Opening the leaderboard ends your current game. You will return to the mode menu to play again."
        >
          <template #footer="{ close }">
            <div class="flex w-full flex-wrap justify-end gap-2">
              <UButton variant="soft" color="neutral" class="font-semibold" @click="close">
                Stay
              </UButton>
              <UButton color="violet" class="font-semibold" @click="confirmLeaveForLeaderboard(close)">
                Go to leaderboard
              </UButton>
            </div>
          </template>
        </UModal>
      </main>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 40px rgba(52, 211, 153, 0.28);
    opacity: 0.95;
  }

  50% {
    box-shadow: 0 0 56px rgba(52, 211, 153, 0.5);
    opacity: 1;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2.2s ease-in-out infinite;
}

@keyframes screen-shake {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  12% {
    transform: translate3d(calc(var(--sk, 8px) * -1), 3px, 0);
  }
  28% {
    transform: translate3d(var(--sk, 8px), -2px, 0);
  }
  44% {
    transform: translate3d(calc(var(--sk, 8px) * -0.55), 2px, 0);
  }
  60% {
    transform: translate3d(calc(var(--sk, 8px) * 0.4), -1px, 0);
  }
  76% {
    transform: translate3d(calc(var(--sk, 8px) * -0.25), 1px, 0);
  }
}

.animate-screen-shake {
  animation: screen-shake var(--sk-dur, 600ms) cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
