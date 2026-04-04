<script setup lang="ts">
import type { GameModeId } from "~/types/game";

definePageMeta({ layout: false });

useHead({
  title: "Leaderboard — Guess the Flag",
  meta: [{ name: "description", content: "Top scores for Guess the Flag." }],
});

const route = useRoute();
const router = useRouter();
const { getTop } = useLeaderboard();

const activeMode = computed<GameModeId>(() =>
  route.query.mode === "marathon" ? "marathon" : "one-life",
);

const rows = computed(() => getTop(activeMode.value, 100));

const leaderboardTabItems = [
  { label: "One life", value: "one-life" },
  { label: "Marathon", value: "marathon" },
];

const modeTab = computed({
  get: () => activeMode.value,
  set: (v: string) => {
    if (v === "one-life" || v === "marathon") {
      router.replace({ path: "/leaderboard", query: { mode: v } });
    }
  },
});
</script>

<template>
  <div
    class="min-h-dvh bg-gradient-to-b from-sky-50 via-white to-violet-50/80 text-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-violet-950/30 dark:text-white"
  >
    <main class="mx-auto max-w-lg px-5 pb-24 pt-12 md:max-w-xl md:pt-16">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500"
          >
            Guess the Flag
          </p>
          <h1 class="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
            Leaderboard
          </h1>
        </div>
        <UButton
          to="/"
          variant="soft"
          color="neutral"
          size="lg"
          class="font-semibold"
        >
          Go back to menu
        </UButton>
      </div>

      <UTabs
        v-model="modeTab"
        :items="leaderboardTabItems"
        :content="false"
        class="mt-6 w-full"
      />

      <p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
        <template v-if="activeMode === 'one-life'">
          Scores post when a One life run ends (wrong country). Stored on this
          device only.
        </template>
        <template v-else>
          Marathon keeps your run going after a miss. New rows appear only when
          you beat your previous best total score. Stored on this device only.
        </template>
      </p>

      <ClientOnly>
        <ul
          class="mt-10 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white/90 shadow-lg dark:divide-white/10 dark:border-white/10 dark:bg-neutral-900/90"
        >
          <li
            v-for="(e, i) in rows"
            :key="e.id"
            class="flex items-center justify-between gap-4 px-4 py-3 first:rounded-t-2xl last:rounded-b-2xl"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span
                class="w-8 shrink-0 text-center text-sm font-bold text-neutral-400 tabular-nums dark:text-neutral-500"
              >
                {{ i + 1 }}
              </span>
              <span
                class="truncate font-semibold tabular-nums text-emerald-700 dark:text-emerald-400"
              >
                {{ e.score.toLocaleString() }} pts
              </span>
            </span>
            <time
              class="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
              :datetime="new Date(e.at).toISOString()"
            >
              {{ new Date(e.at).toLocaleString() }}
            </time>
          </li>
          <li
            v-if="rows.length === 0"
            class="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400"
          >
            <template v-if="activeMode === 'one-life'"
              >No One life scores yet.</template
            >
            <template v-else
              >No Marathon highs yet — keep playing to set a best
              score.</template
            >
          </li>
        </ul>
        <template #fallback>
          <p class="mt-10 text-center text-neutral-500">Loading…</p>
        </template>
      </ClientOnly>
    </main>
  </div>
</template>
