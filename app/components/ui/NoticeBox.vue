<template>
  <div :class="boxClass">
    <slot name="icon" />
    <p class="text-xs text-slate-200">
      <slot />
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tone?: 'info' | 'success'
  }>(),
  { tone: 'info' },
)

const boxClass = computed(() => {
  if (props.tone === 'success') {
    return 'flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-2'
  }

  return 'flex items-center gap-2 rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-3 py-2'
})
</script>
