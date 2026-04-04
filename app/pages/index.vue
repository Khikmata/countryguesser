<script setup lang="ts">
import type { GameModeId } from '~/types/game'

definePageMeta({ layout: false })

useHead({
  title: 'Guess the Flag',
  meta: [{ name: 'description', content: 'A tiny Neal.fun-style flag quiz. Name the country, then the capital.' }]
})

const playSessionActive = useState<boolean>('gf-play-session-active', () => true)

const { ready, startPlayFromMenu } = useGame()

const modes: { id: GameModeId; title: string; blurb: string }[] = [
  {
    id: 'one-life',
    title: 'One life',
    blurb: 'One wrong country ends the run. No skipping.'
  },
  {
    id: 'marathon',
    title: 'Marathon',
    blurb: 'Keep going after mistakes. You can skip a tough flag.'
  }
]

function play(mode: GameModeId) {
  void startPlayFromMenu(mode)
}
</script>

<template>
  <div
    class="min-h-dvh bg-gradient-to-b from-sky-50 via-white to-emerald-50/80 text-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-950/40 dark:text-white"
  >
    <main class="mx-auto flex min-h-dvh max-w-2xl flex-col justify-between px-5 pb-8 pt-12 md:px-8 md:pt-16">
      <div>
        <div class="flex flex-col gap-2 mb-12">
          <h1 class=" text-center text-4xl font-extrabold tracking-tight md:text-5xl">Countryguesser</h1>
          <p class="text-center text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            World flags and more
          </p>
        </div>
        <p class="mx-auto mt-3 max-w-md text-center text-neutral-600 dark:text-neutral-400">
          Pick how you want to play. You can switch anytime from the menu.
        </p>
        <ClientOnly>
          <div v-if="!ready" class="mt-4 flex flex-col items-center gap-3 text-neutral-500">
            <UIcon name="i-lucide-loader-2" class="size-12 animate-spin text-emerald-500" />
            <p>Loading flags…</p>
          </div>
          <ul v-else class="mt-4 grid gap-5 md:grid-cols-2">
            <li
              v-for="m in modes"
              :key="m.id"
              class="flex flex-col rounded-2xl border border-black/10 bg-white/90 p-6 shadow-lg dark:border-white/10 dark:bg-neutral-900/90"
            >
              <div class="flex items-start justify-between gap-2">
                <h2 class="text-xl font-bold tracking-tight">{{ m.title }}</h2>
              </div>
              <p class="mt-2 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
                {{ m.blurb }}
              </p>
              <UButton
                size="xl"
                color="violet"
                class="mt-6 w-full justify-center font-bold shadow-md bg-neutral-600 hover:bg-neutral-500 cursor-pointer"
                @click="play(m.id)"
              >
                Play {{ m.title.toLowerCase() }}
              </UButton>
            </li>
          </ul>
        </ClientOnly>

        <div class="mt-6 flex justify-center">
          <GameHowItWorks />
        </div>
      </div>

      <div class="mt-12 flex justify-center">
        <NuxtLink
          to="/leaderboard"
          class="rounded-full border border-violet-300/70 bg-violet-800 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-violet-900 shadow-md transition hover:bg-violet-200/95 active:scale-[0.98] dark:border-violet-500/35 dark:bg-violet-950/75 dark:text-violet-100 dark:hover:bg-violet-900/80"
        >
          Leaderboards
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
