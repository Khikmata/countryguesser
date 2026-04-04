<script setup lang="ts">
const props = defineProps<{
  guessedFlags: number;
  runTarget: number;
  flagsLeft: number;
  finalScore: number;
  rank: number;
  leaderboardTotal: number;
  answerName: string;
}>();

const emit = defineEmits<{
  "play-again": [];
}>();

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const badRuns = [
  '💀',
  'cooked',
  'ain’t no way 😭',
  'that one didn’t go well',
  'we don’t talk about this',
  'yikes...',
  'ok that was rough'
]

const title = computed(() => {
  const ratio = props.guessedFlags / props.runTarget
  const left = props.flagsLeft

  // Perfect / almost perfect
  if (left === 0) return 'WHAAAAT'
  if (left === 1) return 'So close!'
  if (left === 2) return 'Oof, that one was tricky'

  // High performance
  if (ratio >= 0.85) return 'You’ll get it next run'
  if (ratio >= 0.7) return 'Not bad at all'
  if (ratio >= 0.5) return 'Better luck next time'

  // Low performance
  if (ratio >= 0.3) return 'Getting there'

  // Really bad → random
  return pick(badRuns)
})

</script>

<template>
  <Transition name="fail-backdrop" appear>
    <div
      class="fail-backdrop fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/75 p-6 backdrop-blur-md dark:bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fail-title"
    >
      <Transition name="fail-card" appear>
        <div
          class="fail-card-panel w-full max-w-md rounded-3xl border border-white/10 bg-white px-6 py-8 shadow-2xl dark:border-white/10 dark:bg-neutral-900"
        >
          <p
            id="fail-title"
            class="text-center text-sm font-semibold uppercase tracking-widest text-rose-500"
          >
            Run over
          </p>
          <h2
            class="mt-2 text-center text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white"
          >
            {{ title }}
          </h2>
          <p class="mt-3 text-center text-neutral-600 dark:text-neutral-300">
            The flag was
            <span
              class="font-semibold text-emerald-600 dark:text-emerald-400"
              >{{ answerName }}</span
            >.
          </p>

          <dl class="mt-8 space-y-4 text-center">
            <div class="rounded-2xl bg-neutral-100 py-4 dark:bg-neutral-800/80">
              <dt
                class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
              >
                Flags this run
              </dt>
              <dd
                class="mt-1 text-2xl font-bold tabular-nums text-neutral-900 dark:text-white"
              >
                {{ guessedFlags
                }}<span class="text-neutral-400 dark:text-neutral-500"> / </span
                >{{ runTarget }}
              </dd>
              <dd class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {{ flagsLeft }} flag{{ flagsLeft === 1 ? "" : "s" }} left to
                clear the run
              </dd>
            </div>
            <div
              class="rounded-2xl bg-violet-500/10 py-4 dark:bg-violet-500/15"
            >
              <dt
                class="text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300"
              >
                Final score
              </dt>
              <dd
                class="mt-1 text-2xl font-bold tabular-nums text-violet-900 dark:text-violet-100"
              >
                {{ finalScore }}
              </dd>
            </div>
            <div class="rounded-2xl bg-amber-500/10 py-4 dark:bg-amber-500/15">
              <dt
                class="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200"
              >
                Leaderboard
              </dt>
              <dd
                class="mt-1 text-lg font-bold text-amber-950 dark:text-amber-50"
              >
                #{{ rank
                }}<span
                  class="font-normal text-amber-800/80 dark:text-amber-200/90"
                >
                  of {{ leaderboardTotal }}</span
                >
              </dd>
            </div>
          </dl>

          <div class="mt-8 flex flex-col gap-3">
            <UButton
              block
              size="xl"
              class="font-bold"
              @click="emit('play-again')"
            >
              Play again
            </UButton>
            <UButton
              :to="{ path: '/leaderboard', query: { mode: 'one-life' } }"
              block
              size="lg"
              variant="soft"
              color="neutral"
              class="font-semibold"
            >
              View leaderboard
            </UButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fail-backdrop-enter-active {
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.fail-backdrop-leave-active {
  transition: opacity 0.35s ease;
}

.fail-backdrop-enter-from,
.fail-backdrop-leave-to {
  opacity: 0;
}

.fail-card-enter-active {
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.fail-card-enter-from {
  opacity: 0;
  transform: scale(0.94) translateY(1.25rem);
}

.fail-card-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
