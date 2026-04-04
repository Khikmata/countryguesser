<script setup lang="ts">
import type { DeckCompleteSnapshot } from "~/types/game";

defineProps<{
  snapshot: DeckCompleteSnapshot;
}>();

const emit = defineEmits<{
  "play-again": [];
  "back-menu": [];
  "back-leaderboard": [];
}>();
</script>

<template>
  <Transition name="fail-backdrop" appear>
    <div
      class="fail-backdrop fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/80 p-6 backdrop-blur-md dark:bg-black/85"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-title"
    >
      <Transition name="fail-card" appear>
        <div
          class="fail-card-panel max-h-[min(90dvh,720px)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-white px-6 py-8 shadow-2xl dark:border-white/10 dark:bg-neutral-900"
        >
          <template v-if="snapshot.mode === 'one-life'">
            <p
              id="complete-title"
              class="text-center text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400"
            >
              Completed
            </p>
            <h2
              class="mt-2 text-center text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white"
            >
              You cleared every flag
            </h2>
            <p
              class="mt-4 text-center text-base leading-relaxed text-neutral-600 dark:text-neutral-300"
            >
              {{ snapshot.message }}
            </p>
            <div
              class="mt-8 rounded-2xl bg-emerald-500/10 py-5 text-center dark:bg-emerald-500/15"
            >
              <p
                class="text-xs font-medium uppercase tracking-wide text-emerald-800 dark:text-emerald-200"
              >
                Total score
              </p>
              <p
                class="mt-1 text-4xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300"
              >
                {{ snapshot.score }}
              </p>
              <p class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Rank #{{ snapshot.rank }} of {{ snapshot.total }} on this device
              </p>
            </div>
          </template>

          <template v-else>
            <p
              id="complete-title"
              class="text-center text-sm font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400"
            >
              Full set — Marathon
            </p>
            <h2
              class="mt-2 text-center text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white"
            >
              You finished the whole set
            </h2>
            <dl class="mt-6 space-y-3 text-center">
              <div
                class="rounded-2xl bg-violet-500/10 py-4 dark:bg-violet-500/15"
              >
                <dt
                  class="text-xs font-medium uppercase tracking-wide text-violet-800 dark:text-violet-200"
                >
                  Final score
                </dt>
                <dd
                  class="mt-1 text-3xl font-bold tabular-nums text-violet-900 dark:text-violet-100"
                >
                  {{ snapshot.score }}
                </dd>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div
                  class="rounded-2xl bg-neutral-100 py-4 dark:bg-neutral-800/80"
                >
                  <dt
                    class="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                  >
                    Flag accuracy
                  </dt>
                  <dd
                    class="mt-1 text-2xl font-bold tabular-nums text-neutral-900 dark:text-white"
                  >
                    {{ snapshot.accuracyPct }}%
                  </dd>
                </div>
                <div
                  class="rounded-2xl bg-amber-500/10 py-4 dark:bg-amber-500/15"
                >
                  <dt
                    class="text-xs font-medium uppercase tracking-wide text-amber-900 dark:text-amber-100"
                  >
                    Best streak (this run)
                  </dt>
                  <dd
                    class="mt-1 text-2xl font-bold tabular-nums text-amber-950 dark:text-amber-50"
                  >
                    {{ snapshot.bestStreakThisRun }}
                  </dd>
                </div>
              </div>
            </dl>
            <div class="mt-6">
              <h3
                class="text-center text-sm font-semibold text-neutral-700 dark:text-neutral-200"
              >
                Wrong or skipped
              </h3>
              <ul
                v-if="snapshot.missed.length"
                class="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-black/10 bg-neutral-50 px-3 py-2 text-left text-sm dark:border-white/10 dark:bg-neutral-800/50"
              >
                <li
                  v-for="(row, i) in snapshot.missed"
                  :key="`${row.name}-${row.kind}-${i}`"
                  class="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 odd:bg-black/[0.03] dark:odd:bg-white/[0.04]"
                >
                  <span
                    class="font-medium text-neutral-800 dark:text-neutral-100"
                    >{{ row.name }}</span
                  >
                  <span
                    class="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
                    :class="
                      row.kind === 'wrong'
                        ? 'bg-rose-500/15 text-rose-800 dark:text-rose-200'
                        : 'bg-neutral-500/15 text-neutral-700 dark:text-neutral-200'
                    "
                  >
                    {{ row.kind === "wrong" ? "Wrong" : "Skipped" }}
                  </span>
                </li>
              </ul>
              <p
                v-else
                class="mt-3 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-center text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-950/30 dark:text-emerald-100"
              >
                Clean run — you did not miss or skip any flag.
              </p>
            </div>
          </template>

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
              block
              size="lg"
              variant="soft"
              color="neutral"
              class="font-semibold"
              @click="emit('back-leaderboard')"
            >
              To leaderboards
            </UButton>
            <UButton
              block
              size="lg"
              variant="soft"
              color="neutral"
              class="font-semibold"
              @click="emit('back-menu')"
            >
              Mode menu
            </UButton>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fail-backdrop-enter-active {
  transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.fail-backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.fail-backdrop-enter-from,
.fail-backdrop-leave-to {
  opacity: 0;
}

.fail-card-enter-active {
  transition:
    opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1);
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
