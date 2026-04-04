<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <UCollapsible
    v-model:open="open"
    class="w-full max-w-xl"
    :unmount-on-hide="false"
  >
    <template #default="{ open: expanded }">
      <button
        type="button"
        class="mx-auto flex w-full max-w-md items-center justify-center gap-2 pb-0.5 text-center text-sm font-medium text-violet-600 transition hover:border-violet-600 hover:text-violet-700 dark:border-violet-400/60 dark:text-violet-300 dark:hover:border-violet-300 dark:hover:text-violet-200"
        :aria-expanded="expanded"
        aria-label="How scoring, hints, and game modes work"
      >
        <span>How this works</span>
        <UIcon
          :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 shrink-0 opacity-80"
        />
      </button>
    </template>
    <template #content>
      <div
        class="mx-auto mt-4 max-w-xl space-y-3 rounded-2xl border border-neutral-200/90 bg-white/90 px-4 py-4 text-left text-sm leading-relaxed text-neutral-700 shadow-sm dark:border-white/10 dark:bg-neutral-900/90 dark:text-neutral-300"
      >
        <p>
          <span class="font-semibold text-neutral-900 dark:text-white">One life.</span>
          One wrong country ends the run. After a short beat you see the end screen with your flags progress, final
          score (then reset to 0), and rank on the One life leaderboard. Hints refill to 3 when you start a new run or
          switch mode.
        </p>
        <p>
          <span class="font-semibold text-neutral-900 dark:text-white">Marathon.</span>
          Wrong country? No game-over screen — you keep your score, see the answer briefly, and the next flag loads.
          Streak resets. Your best total score can appear on the Marathon leaderboard when you beat your previous best.
          Hints still refill to 3 when you start fresh (new run / mode change).
        </p>
        <p>
          <span class="font-semibold text-neutral-900 dark:text-white">Hints.</span>
          You can hold up to 3 hints. Each tap reveals more letters for the country or capital (bonus) and costs one
          hint from the shared pool. Every 3 flags you finish (Next or Skip) you gain +1 hint, up to the cap.
        </p>
        <p>
          <span class="font-semibold text-neutral-900 dark:text-white">Scoring.</span>
          Faster correct guesses earn a speed multiplier on flag and capital points (up to about 2×). Clearing 10 flags in
          a row without failing the segment gives a +50 bonus (both modes).
        </p>
      </div>
    </template>
  </UCollapsible>
</template>
