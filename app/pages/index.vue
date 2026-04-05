<script setup lang="ts">
import GameHowItWorks from "~/components/Game/GameHowItWorks.vue";
import type { GameModeId } from "~/types/game";

definePageMeta({ layout: false });

useSeoMeta({
  title: "Countryguesser — country quiz",
  description:
    "Free flag quiz: choose One life or Marathon, name countries from flags, guess capitals for points and rating on leaderboards",
  ogTitle: "Countryguesser",
  ogDescription:
    "Geography game — name the country from its flag, then the capital. Two modes, hints, and speed scoring.",
  ogType: "website",
  twitterCard: "summary_large_image",
});

const { status, startPlayFromMenu } = useGame();

const modes: { id: GameModeId; title: string; blurb: string }[] = [
  {
    id: "one-life",
    title: "One life",
    blurb: "One wrong country ends the run. No skipping.",
  },
  {
    id: "marathon",
    title: "Marathon",
    blurb: "Keep going after mistakes. You can skip a tough flag.",
  },
];

function play(mode: GameModeId) {
  void startPlayFromMenu(mode);
}
</script>

<template>
  <div
    class="min-h-dvh bg-gradient-to-b from-0 via-white to-emerald-50/60 text-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-950/40 dark:text-white"
  >
    <main
      class="mx-auto flex min-h-dvh max-w-2xl flex-col justify-between px-5 pb-8 pt-12 md:px-8 md:pt-16"
    >
      <div>
        <div class="flex flex-col gap-2 mb-12">
          <h1 class="text-center text-4xl font-extrabold tracking-tight md:text-5xl">
            Countryguesser
          </h1>
          <p
            class="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500"
          >
            World flags and more
          </p>
        </div>
        <p class="mx-auto mt-3 max-w-md text-center text-neutral-600 dark:text-neutral-400">
          Pick how you want to play. You can switch anytime from the menu.
        </p>
        <div class="mt-4 grid gap-5 md:grid-cols-2">
          <UCard
            v-for="m in modes"
            :key="m.id"
            class="flex flex-col ring-1 ring-black/5 dark:ring-white/10"
          >
            <template #header>
              <h2 class="text-xl font-bold tracking-tight">{{ m.title }}</h2>
            </template>
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              {{ m.blurb }}
            </p>
            <ClientOnly>
              <UButton
                size="xl"
                color="neutral"
                class="mt-6 w-full justify-center cursor-pointer font-bold shadow-md"
                @click="play(m.id)"
              >
                Play {{ m.title.toLowerCase() }}
              </UButton>
              <template #fallback>
                <USkeleton class="mt-6 h-10 w-full" />
              </template>
            </ClientOnly>
          </UCard>
        </div>
        <div class="mt-6 flex justify-center">
          <ClientOnly>
            <GameHowItWorks />
          </ClientOnly>
        </div>
      </div>

      <div class="mt-12 flex justify-center">
        <NuxtLink
          to="/leaderboard"
          class="rounded-full border border-violet-300/70 bg-neutral-800 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-neutral-100 shadow-md transition hover:bg-violet-200/95 active:scale-[0.98] dark:border-violet-500/35 dark:bg-violet-950/75 dark:text-violet-100 dark:hover:bg-violet-900/80"
        >
          Leaderboards
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
