<script setup lang="ts">
const props = defineProps<{
  src: string;
  alt: string;
  celebrate?: boolean;
}>();

const imageLoaded = ref(false);

watch(
  () => props.src,
  () => {
    imageLoaded.value = false;
  },
);
</script>

<template>
  <div
    class="group relative w-full max-w-md px-2 transition-all duration-500 ease-out"
    :class="celebrate ? 'scale-105 md:scale-110' : 'scale-100'"
  >
    <div
      class="relative overflow-hidden rounded-3xl bg-white shadow-lg shadow-neutral-900/10 ring-1 ring-black/5 transition duration-300 ease-out dark:bg-neutral-900 dark:ring-white/10 dark:shadow-black/40"
    >
      <USkeleton
        v-show="!imageLoaded"
        class="absolute inset-0 z-10 min-h-[12rem] w-full rounded-3xl"
      />
      <div class="min-h-[12rem] w-full overflow-hidden">
        <img
          :src="src"
          :alt="alt"
          class="h-full min-h-[12rem] w-full object-cover transition-opacity duration-300 ease-out"
          :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
          loading="eager"
          decoding="async"
          @load="imageLoaded = true"
        />
      </div>
    </div>
  </div>
</template>
