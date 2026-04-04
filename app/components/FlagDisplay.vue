<script setup lang="ts">
const props = defineProps<{
  src: string
  alt: string
  celebrate?: boolean
}>()


</script>

<template>
  <div
    class="group relative w-full max-w-md px-2 transition-all duration-500 ease-out"
    :class="celebrate ? 'scale-105 md:scale-110' : 'scale-100'"
  >
    <div
      class="overflow-hidden rounded-3xl bg-white shadow-lg shadow-neutral-900/10 ring-1 ring-black/5 transition duration-300 ease-out dark:bg-neutral-900 dark:ring-white/10 dark:shadow-black/40"
    >
      <div class=" w-full overflow-hidden">
        <img
         :src="src"
         :alt="alt"
         class="h-full w-full object-cover transition-transform duration-300 ease-out"
         loading="eager"
        >
      </div>
    </div>
  </div>
</template>
