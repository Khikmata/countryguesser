<script setup lang="ts">
import type { Country } from "~/types/quiz";

defineProps<{
  countries: Country[];
  disabled?: boolean;
  shake?: boolean;
  currentCountry: Country | null;
  capitalHintDisplay?: string;
  capitalHintDisabled?: boolean;
  capitalHintLabel?: string;
}>();

defineEmits<{
  submit: [];
  hint: [];
}>();

const model = defineModel<string>({ default: "" });
</script>

<template>
  <div class="w-full max-w-md overflow-visible">
    <p
      class="text-center text-base leading-relaxed text-neutral-600 dark:text-neutral-300"
    >
      Bonus: what’s the capital of
      <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{
        currentCountry?.name
      }}</span
      >?
    </p>
    <p class="text-center text-neutral-500 dark:text-neutral-400">
      (optional — extra points if you get it.)
    </p>
    <div class="mt-4 flex w-full flex-col items-center gap-3">
      <UFieldGroup size="xl" class="w-full gap-4">
        <AutocompleteInput
          v-model="model"
          class="min-w-0 flex-1 max-w-none"
          field="capital"
          :countries="countries"
          :disabled="disabled"
          :success="false"
          :shake="shake"
          placeholder="Type to search capitals…"
          aria-label="Capital city guess (optional)"
          @submit="$emit('submit')"
        />
        <UButton
          color="neutral"
          size="xl"
          variant="subtle"
          icon="material-symbols:lightbulb"
          class="shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="capitalHintDisabled"
          :aria-label="capitalHintLabel"
          @click="$emit('hint')"
        />
      </UFieldGroup>
      <p
        v-if="capitalHintDisplay"
        class="w-full rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-center font-mono text-sm tracking-wide text-amber-950 dark:border-amber-500/25 dark:bg-amber-950/30 dark:text-amber-100"
      >
        {{ capitalHintDisplay }}
      </p>
    </div>
  </div>
</template>
