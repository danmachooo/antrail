<template>
  <article
    class="rounded-xl border bg-slate-900/80 p-4 transition"
    :class="isEditing ? 'border-cyan-400/40' : 'border-slate-800 hover:border-slate-600'"
  >
    <template v-if="!isEditing">
      <div class="flex items-start gap-3">
        <div class="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-500/10 text-xs font-bold text-cyan-200">
          {{ step.stepNumber }}
        </div>

        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-slate-100">{{ step.title }}</h3>
          <p class="mt-1 text-sm leading-6 text-slate-400">{{ step.instruction }}</p>

          <div class="mt-3 flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200">
              <Target class="h-3 w-3" />
              {{ step.uiElementHint || 'UI hint missing' }}
            </span>
            <span class="rounded-md border border-cyan-400/30 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-200">
              {{ step.elementType }}
            </span>
            <span class="rounded-md border border-amber-400/30 bg-amber-500/10 px-2 py-1 font-mono text-[11px] text-amber-200">
              {{ step.confirmedSelector ?? step.suggestedSelector ?? 'no selector' }}
            </span>
            <span
              class="rounded-md border px-2 py-1 text-[11px]"
              :class="confidenceClass"
            >
              {{ Math.round(step.confidence * 100) }}% confidence
            </span>
          </div>
        </div>

        <div class="flex flex-none flex-col gap-2">
          <AppButton variant="ghost" size="sm" @click="startEdit">
            <PencilLine class="h-3.5 w-3.5" />
            Edit
          </AppButton>
          <AppButton variant="danger" size="sm" @click="emit('delete')">
            <Trash2 class="h-3.5 w-3.5" />
            Remove
          </AppButton>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="space-y-4">
        <div class="grid gap-3 md:grid-cols-[1fr_220px]">
          <label class="space-y-1">
            <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Title</span>
            <input
              v-model="draft.title"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60"
              placeholder="Step title"
            />
          </label>

          <label class="space-y-1">
            <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Element Type</span>
            <select
              v-model="draft.elementType"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60"
            >
              <option>button</option>
              <option>input</option>
              <option>navigation</option>
              <option>link</option>
              <option>form</option>
              <option>table</option>
            </select>
          </label>
        </div>

        <label class="space-y-1">
          <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Instruction</span>
          <textarea
            v-model="draft.instruction"
            rows="3"
            class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-400/60"
          />
        </label>

        <label class="space-y-1">
          <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">UI Element Hint</span>
          <input
            v-model="draft.uiElementHint"
            class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/60"
            placeholder="e.g. Save button, top-right corner"
          />
        </label>

        <label class="space-y-1">
          <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">CSS Selector (confirmed)</span>
          <input
            v-model="draft.confirmedSelector"
            class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400/60"
            placeholder="#my-element or .my-class"
          />
        </label>

        <div class="flex flex-wrap items-center gap-3">
          <AppButton size="sm" @click="save">
            <Check class="h-3.5 w-3.5" />
            Save
          </AppButton>
          <AppButton variant="ghost" size="sm" @click="cancel">
            <X class="h-3.5 w-3.5" />
            Cancel
          </AppButton>
        </div>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { Check, PencilLine, Target, Trash2, X } from 'lucide-vue-next'

import type { TutorialStep } from '~/data/mock'
import AppButton from '~/components/ui/AppButton.vue'

const props = defineProps<{ step: TutorialStep }>()
const emit = defineEmits<{
  (event: 'update', patch: Partial<TutorialStep>): void
  (event: 'delete'): void
}>()

const isEditing = ref(false)
const draft = ref<TutorialStep>({ ...props.step })

const confidenceClass = computed(() => {
  const confidence = props.step.confidence
  if (confidence >= 0.9) return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
  if (confidence >= 0.75) return 'border-amber-400/30 bg-amber-500/10 text-amber-200'
  return 'border-rose-400/30 bg-rose-500/10 text-rose-200'
})

function startEdit() {
  draft.value = { ...props.step }
  isEditing.value = true
}

function save() {
  emit('update', { ...draft.value })
  isEditing.value = false
}

function cancel() {
  draft.value = { ...props.step }
  isEditing.value = false
}

watch(
  () => props.step,
  (value) => {
    if (!isEditing.value) draft.value = { ...value }
  },
  { deep: true },
)
</script>
