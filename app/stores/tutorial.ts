import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { TutorialData, TutorialStep } from '~/data/mock'

export type PipelineStage = 'upload' | 'extracting' | 'json' | 'steps' | 'preview' | 'export'

export const useTutorialStore = defineStore('tutorial', () => {
  const stage = ref<PipelineStage>('upload')
  const tutorial = ref<TutorialData | null>(null)
  const manualText = ref('')
  const fileName = ref('')
  const isLoading = ref(false)
  const loadingProgress = ref(0)
  const loadingMessage = ref('')
  const activeStepIndex = ref(0)

  const steps = computed(() => tutorial.value?.steps ?? [])
  const hasData = computed(() => tutorial.value !== null)
  const currentStep = computed(() => steps.value[activeStepIndex.value] ?? null)

  function setStage(nextStage: PipelineStage) {
    stage.value = nextStage
  }

  function setTutorial(data: TutorialData) {
    tutorial.value = data
  }

  function updateStep(index: number, patch: Partial<TutorialStep>) {
    if (!tutorial.value) return
    const current = tutorial.value.steps[index]
    if (!current) return

    tutorial.value.steps[index] = {
      stepNumber: patch.stepNumber ?? current.stepNumber,
      title: patch.title ?? current.title,
      instruction: patch.instruction ?? current.instruction,
      uiElementHint: patch.uiElementHint ?? current.uiElementHint,
      elementType: patch.elementType ?? current.elementType,
      suggestedSelector: patch.suggestedSelector ?? current.suggestedSelector,
      confirmedSelector: patch.confirmedSelector ?? current.confirmedSelector,
      confidence: patch.confidence ?? current.confidence,
    }
  }

  function deleteStep(index: number) {
    if (!tutorial.value) return
    tutorial.value.steps.splice(index, 1)
    tutorial.value.steps.forEach((step, i) => {
      step.stepNumber = i + 1
    })
    tutorial.value.totalSteps = tutorial.value.steps.length
  }

  function addStep() {
    if (!tutorial.value) return

    const newStep: TutorialStep = {
      stepNumber: tutorial.value.steps.length + 1,
      title: 'New Step',
      instruction: 'Describe what the user should do here.',
      uiElementHint: '',
      elementType: 'button',
      suggestedSelector: null,
      confirmedSelector: null,
      confidence: 1,
    }

    tutorial.value.steps.push(newStep)
    tutorial.value.totalSteps = tutorial.value.steps.length
  }

  function moveStep(from: number, to: number) {
    if (!tutorial.value) return

    const items = tutorial.value.steps
    const [moved] = items.splice(from, 1)
    if (!moved) return
    items.splice(to, 0, moved)
    items.forEach((step, i) => {
      step.stepNumber = i + 1
    })
  }

  function reset() {
    stage.value = 'upload'
    tutorial.value = null
    manualText.value = ''
    fileName.value = ''
    isLoading.value = false
    loadingProgress.value = 0
    loadingMessage.value = ''
    activeStepIndex.value = 0
  }

  return {
    stage,
    tutorial,
    manualText,
    fileName,
    isLoading,
    loadingProgress,
    loadingMessage,
    activeStepIndex,
    steps,
    hasData,
    currentStep,
    setStage,
    setTutorial,
    updateStep,
    deleteStep,
    addStep,
    moveStep,
    reset,
  }
})
