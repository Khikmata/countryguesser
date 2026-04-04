<script setup lang="ts">
import type { Country } from '~/types/quiz'

defineProps<{
  countryName: string
  countries: Country[]
  disabled?: boolean
  shake?: boolean
  capitalHintDisplay?: string
  capitalHintDisabled?: boolean
  capitalHintLabel?: string
}>()

defineEmits<{
  submit: []
  hint: []
}>()

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="w-full max-w-md overflow-visible">
    <p class="text-center text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
      Bonus: what’s the capital of
      <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ countryName }}</span>? <span class="text-neutral-500 dark:text-neutral-400">(optional — extra points if you get it.)</span>
    </p>
    <div class="mt-4 flex flex-col items-center gap-3">
      <AutocompleteInput
        v-model="model"
        field="capital"
        :countries="countries"
        :disabled="disabled"
        :success="false"
        :shake="shake"
        placeholder="Type to search capitals…"
        aria-label="Capital city guess (optional)"
        @submit="$emit('submit')"
      />
      <div class="flex w-full flex-col items-center gap-2">
        <div class="flex items-center justify-center gap-2">
          <UButton
            size="md"
            variant="primary"
            color="amber"
            class="font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="capitalHintDisabled"
            aria-label="Spend one saved hint to reveal part of the capital name"
            @click="$emit('hint')"
          >
            {{ capitalHintLabel }}
          </UButton>
        </div>
        <p
          v-if="capitalHintDisplay"
          class="w-full rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-center font-mono text-sm tracking-wide text-amber-950 dark:border-amber-500/25 dark:bg-amber-950/30 dark:text-amber-100"
        >
          {{ capitalHintDisplay }}
        </p>
      </div>
    </div>
  </div>
</template>
