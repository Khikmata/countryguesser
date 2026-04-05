<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { GameModeId } from "~/types/game";

type LeaderboardRow = {
  rank: number;
  score: string;
  date: string;
};

definePageMeta({ layout: false });

useSeoMeta({
  title: "Leaderboard",
  description: "High scores for One life and Marathon modes in Countryguesser",
  ogTitle: "Countryguesser — Leaderboard",
  ogDescription: "View your best One life and Marathon scores from the country quiz",
  ogType: "website",
  twitterCard: "summary_large_image",
});

const route = useRoute();
const router = useRouter();
const { getTop } = useLeaderboard();

const activeMode = computed<GameModeId>(() =>
  route.query.mode === "marathon" ? "marathon" : "one-life",
);

const rows = computed(() => getTop(activeMode.value, 10));

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

import { h } from "vue";

const columns: TableColumn<LeaderboardRow, any>[] = [
  {
    accessorKey: "rank",
    header: "#",
    cell: ({ row }) => {
      const rank = row.getValue("rank") as number;

      // Assign color classes for top 3 ranks
      const rankColors: Record<number, string> = {
        1: "text-amber-400",
        2: "text-amber-200",
        3: "text-orange-50",
      };

      const className = rankColors[rank] ?? "text-neutral-400";

      // Return a span with the rank as inner text
      return h(
        "span",
        {
          class: `font-bold ${className} tabular-nums`,
        },
        rank.toString(),
      );
    },
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => {
      const score = row.getValue("score") as string;
      return h("span", { class: "text-emerald-700 dark:text-emerald-400 font-semibold" }, score);
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return h(
        "time",
        {
          datetime: new Date(date).toISOString(),
          class: "text-xs text-neutral-500 dark:text-neutral-400",
        },
        date,
      );
    },
  },
];

const tableRows = computed<LeaderboardRow[]>(() =>
  rows.value.map((r, i) => ({
    rank: i + 1,
    score: `${r.score.toLocaleString()} pts`,
    date: new Date(r.at).toLocaleString(),
  })),
);
</script>

<template>
  <div
    class="min-h-dvh bg-linear-to-b from-sky-50 via-white to-orange-50/80 text-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-orange-950/30 dark:text-white"
  >
    <main class="mx-auto max-w-lg px-5 pb-24 pt-12 md:max-w-xl md:pt-16">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500"
          >
            Countryguesser
          </p>
          <h1 class="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">Leaderboard</h1>
        </div>
        <UButton to="/" variant="soft" color="neutral" size="lg" class="font-semibold">
          Go back to menu
        </UButton>
      </div>

      <!-- Tabs -->
      <UTabs v-model="modeTab" :items="leaderboardTabItems" :content="false" class="mt-6 w-full" />

      <!-- Description -->
      <p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
        <template v-if="activeMode === 'one-life'">
          Scores post when a One life run ends (wrong country). Stored on this device only.
        </template>
        <template v-else>
          Marathon keeps your run going after a miss. New rows appear only when you beat your
          previous best total score. Stored on this device only.
        </template>
      </p>

      <!-- Leaderboard Table -->
      <ClientOnly>
        <UTable
          class="mt-10 rounded-2xl border border-black/10 bg-white/90 shadow-lg dark:border-white/10 dark:bg-neutral-900/90"
          :columns="columns"
          :data="tableRows"
          striped
          hover
        >
          <template #empty-state>
            <div class="px-4 py-12 text-center text-neutral-500 dark:text-neutral-400">
              <template v-if="activeMode === 'one-life'"> No One life scores yet. </template>
              <template v-else>
                No Marathon highs yet — keep playing to set a best score.
              </template>
            </div>
          </template>
          <template #loading-state>
            <USkeleton class="h-48 w-full rounded-lg" />
          </template>
        </UTable>
      </ClientOnly>
    </main>
  </div>
</template>
