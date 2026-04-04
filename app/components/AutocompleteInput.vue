<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import Fuse from 'fuse.js';
import type { Country } from '~/types/quiz';
import { segmentsSimple } from '~/utils/text';

const props = withDefaults(
  defineProps<{
    modelValue: string
    countries: Country[]
    field?: 'name' | 'capital'
    disabled?: boolean
    success?: boolean
    shake?: boolean
    /** Max horizontal shake distance (px) when shake is true */
    shakeAmplitudePx?: number
    shakeDurationMs?: number
    placeholder?: string
    ariaLabel?: string
  }>(),
  {
    field: 'name',
    placeholder: 'Type a country…',
    ariaLabel: 'Search',
    shakeAmplitudePx: 6,
    shakeDurationMs: 550
  }
)

const emit = defineEmits<{
  'update:modelValue': [v: string]
  submit: []
}>()

const query = ref('')
const debouncedQ = ref('')
const open = ref(false)
const activeIdx = ref(-1)
const pickedCommit = ref<string | null>(null)
const rootId = useId()
const listId = `${rootId}-list`
const rootRef = ref<HTMLElement | null>(null)

const fuseItems = computed(() => {
  if (props.field === 'name') {
    return props.countries.map((c) => ({ label: c.name, key: c.id }))
  }
  const caps = new Set<string>()
  for (const c of props.countries) caps.add(c.capital)
  return [...caps].sort().map((cap) => ({ label: cap, key: cap }))
})

const fuse = computed(
  () =>
    new Fuse(fuseItems.value, {
      keys: ['label'],
      threshold: 0.36,
      ignoreLocation: true,
      minMatchCharLength: 1
    })
)

const topFive = computed(() => {
  const q = debouncedQ.value.trim()
  if (!q) return []
  return fuse.value.search(q).slice(0, 5).map((r) => r.item)
})

const runDebounced = useDebounceFn((q: string) => {
  debouncedQ.value = q
  activeIdx.value = -1
}, 160)

watch(
  () => props.modelValue,
  (v) => {
    if (v !== query.value) query.value = v
  },
  { immediate: true }
)

watch(query, (q) => {
  if (pickedCommit.value !== null && q.trim() !== pickedCommit.value) {
    pickedCommit.value = null
  }
  emit('update:modelValue', q)
  runDebounced(q)
})

watch([debouncedQ, topFive, () => props.disabled, pickedCommit], () => {
  open.value =
    !!debouncedQ.value.trim() &&
    topFive.value.length > 0 &&
    !props.disabled &&
    pickedCommit.value === null
})

watch(topFive, () => {
  if (activeIdx.value >= topFive.value.length) activeIdx.value = topFive.value.length - 1
})

function segments(label: string) {
  return segmentsSimple(label, debouncedQ.value)
}

function choose(label: string) {
  const t = label.trim()
  pickedCommit.value = t
  query.value = label
  emit('update:modelValue', label)
  activeIdx.value = -1
  open.value = false
}

function move(delta: number) {
  const n = topFive.value.length
  if (!n) return
  if (activeIdx.value < 0) activeIdx.value = delta > 0 ? 0 : n - 1
  else activeIdx.value = (activeIdx.value + delta + n) % n
}

function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (!debouncedQ.value.trim()) return
    open.value = true
    move(1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    open.value = true
    move(-1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (open.value && activeIdx.value >= 0) {
      const it = topFive.value[activeIdx.value]
      if (it) choose(it.label)
    }
    emit('submit')
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function onFocus() {
  if (
    !props.disabled &&
    pickedCommit.value === null &&
    debouncedQ.value.trim() &&
    topFive.value.length
  ) {
    open.value = true
  }
}

function onBlur() {
  open.value = false
  window.setTimeout(() => {
    const a = document.activeElement
    if (!rootRef.value?.contains(a)) {
      pickedCommit.value = null
    }
  }, 0)
}
</script>

<template>
  <div
    ref="rootRef"
    class="relative w-full max-w-md transition-transform duration-300"
    :class="shake ? 'animate-shake' : ''"
    :style="
      shake
        ? ({ '--shake-x': `${props.shakeAmplitudePx}px` } as Record<string, string>)
        : undefined
    "
  >
    <UInput
      v-model="query"
      size="xl"

      variant="outline"
      class="w-full text-center text-lg font-medium transition-all duration-300 md:text-xl"
      :class="[
        success
          ? 'ring-4 ring-emerald-400/80 !shadow-[0_0_28px_rgba(52,211,153,0.45)] dark:ring-emerald-400/70'
          : 'ring-1 ring-black/8 dark:ring-white/15',
        disabled ? 'pointer-events-none opacity-80' : ''
      ]"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="activeIdx >= 0 ? `${listId}-opt-${activeIdx}` : undefined"
      role="combobox"
      autocomplete="off"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
    />
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="pointer-events-none -translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="-translate-y-0.5 opacity-0"
    >
      <ul
        v-show="open && !disabled"
        :id="listId"
        role="listbox"
        class="absolute z-[100] mt-3 max-h-[min(18rem,calc(100dvh-12rem))] w-full overflow-y-auto overscroll-contain rounded-2xl border border-black/10 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-neutral-900"
      >
        <li
          v-for="(it, i) in topFive"
          :id="`${listId}-opt-${i}`"
          :key="it.key + i"
          role="option"
          :aria-selected="i === activeIdx"
          class="cursor-pointer px-4 py-3 text-base transition-colors"
          :class="
            i === activeIdx
              ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-100'
              : 'hover:bg-black/5 dark:hover:bg-white/10'
          "
          @mousedown.prevent="choose(it.label)"
        >
          <span v-for="(seg, si) in segments(it.label)" :key="si">
            <mark
              v-if="seg.highlight"
              class="rounded bg-amber-200/90 px-0.2 text-inherit dark:bg-amber-400/30"
            >{{ seg.text }}</mark>
            <span v-else>{{ seg.text }}</span>
          </span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(calc(-1 * var(--shake-x, 6px)));
  }
  40% {
    transform: translateX(var(--shake-x, 6px));
  }
  60% {
    transform: translateX(calc(-0.65 * var(--shake-x, 6px)));
  }
  80% {
    transform: translateX(calc(0.45 * var(--shake-x, 6px)));
  }
}

.animate-shake {
  animation: shake 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
</style>
