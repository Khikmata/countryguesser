<script setup lang="ts">
defineProps<{
  streak: number;
  bestStreak: number;
  score: number;
}>();

defineEmits<{
  leaderboards: [];
}>();
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-30">
    <div class="flex flex-col items-center justify-center gap-2 px-4 pb-safe pt-3">
      <button
        type="button"
        class="hidden items-center justify-center rounded-full bg-neutral-600/90 px-4 py-2 text-xs font-bold uppercase tracking-wide text-neutral-100 shadow-md backdrop-blur-sm transition hover:bg-violet-200/95 active:scale-[0.98] md:inline-flex dark:border-violet-500/35 dark:bg-violet-950/75 dark:text-violet-100 dark:hover:bg-violet-900/80"
        @click="$emit('leaderboards')"
      >
        Go to leaderboards
      </button>
    </div>
    <div class="pointer-events-none flex justify-center px-4 pb-safe pt-3">
      <div
        class="pointer-events-auto flex max-w-lg flex-wrap items-center justify-center gap-2 rounded-full border border-black/10 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/90"
      >
        <UBadge color="warning" variant="subtle" size="lg" class="tabular-nums">
          <span class="opacity-80">Streak</span>
          <Transition mode="out-in" name="pop-num">
            <span :key="streak" class="ml-1 font-bold">{{ streak }}</span>
          </Transition>
        </UBadge>
        <UBadge color="secondary" variant="subtle" size="lg" class="tabular-nums">
          <span class="opacity-80">Best</span>
          <span class="ml-1 font-bold">{{ bestStreak }}</span>
        </UBadge>
        <UBadge color="success" variant="subtle" size="lg" class="tabular-nums">
          <span class="opacity-80">Score</span>
          <Transition mode="out-in" name="pop-num">
            <span :key="score" class="ml-1 font-bold">{{ score }}</span>
          </Transition>
        </UBadge>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
}

.pop-num-enter-active,
.pop-num-leave-active {
  transition:
    transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}
.pop-num-enter-from {
  opacity: 0;
  transform: scale(0.6) translateY(6px);
}
.pop-num-leave-to {
  opacity: 0;
  transform: scale(1.15) translateY(-4px);
}
</style>
