<template>
  <PanelShell step="3" title="Refine Steps" :subtitle="`${store.steps.length} steps ready for review`">
    <div class="space-y-5">
      <TransitionGroup name="step-list" tag="div" class="relative space-y-3">
        <StepCard
          v-for="(step, index) in store.steps"
          :key="`step-${step.stepNumber}-${index}`"
          :step="step"
          @update="(patch) => store.updateStep(index, patch)"
          @delete="store.deleteStep(index)"
        />
      </TransitionGroup>

      <div class="flex flex-wrap items-center gap-3">
        <AppButton variant="ghost" size="sm" @click="store.addStep()">
          <Plus class="h-3.5 w-3.5" />
          Add Step
        </AppButton>
      </div>

      <div class="h-px bg-slate-800" />

      <div class="flex flex-wrap items-center gap-3">
        <AppButton @click="store.setStage('preview')">
          <Play class="h-4 w-4" />
          Preview Tutorial
        </AppButton>
        <AppButton variant="secondary" @click="store.setStage('export')">
          <ArrowRight class="h-4 w-4" />
          Skip to Export
        </AppButton>
      </div>
    </div>
  </PanelShell>
</template>

<script setup lang="ts">
import { ArrowRight, Play, Plus } from 'lucide-vue-next'

import { useTutorialStore } from '~/stores/tutorial'
import AppButton from '~/components/ui/AppButton.vue'
import PanelShell from '~/components/ui/PanelShell.vue'

const store = useTutorialStore()
</script>

<style scoped>
.step-list-move,
.step-list-enter-active,
.step-list-leave-active {
  transition: all 0.25s ease;
}

.step-list-enter-from,
.step-list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.step-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
