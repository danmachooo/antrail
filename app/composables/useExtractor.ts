import { LOADING_MESSAGES, MOCK_TUTORIAL } from '~/data/mock'
import { useTutorialStore } from '~/stores/tutorial'

export function useExtractor() {
  const store = useTutorialStore()

  async function extract(text: string, filename = 'manual.txt') {
    if (!text.trim()) return false

    store.isLoading = true
    store.loadingProgress = 0
    store.fileName = filename
    store.setStage('extracting')

    for (let i = 0; i < LOADING_MESSAGES.length; i += 1) {
      store.loadingMessage = LOADING_MESSAGES[i] ?? ''
      store.loadingProgress = Math.round(((i + 1) / LOADING_MESSAGES.length) * 100)
      await delay(380 + Math.random() * 180)
    }

    store.setTutorial(structuredClone(MOCK_TUTORIAL))
    store.isLoading = false
    store.setStage('json')
    return true
  }

  return { extract }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
