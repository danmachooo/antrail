// composables/useExtractor.ts
import { useTutorialStore } from "~/stores/tutorial"

export function useExtractor() {
	const store = useTutorialStore()

	async function extract(text: string, filename = "manual.txt") {
		if (!text.trim()) return false

		store.isLoading = true
		store.loadingProgress = 0
		store.loadingMessage = "⟳ Sending to server..."
		store.fileName = filename
		store.setStage("extracting")

		try {
			const progressInterval = startProgressSimulation()

			const result = await $fetch("/api/extract", {
				method: "POST",
				body: { text, filename },
			})

			clearInterval(progressInterval)

			store.loadingProgress = 100
			store.loadingMessage = "✓ Complete! Building step cards..."

			await delay(400)

			store.setTutorial(result as any)
			store.setStage("json")
			return true
		} catch (err: any) {
			store.loadingMessage = `✗ Error: ${err?.data?.message ?? err?.message ?? "Something went wrong."}`
			store.loadingProgress = 0
			store.setStage("upload")
			return false
		} finally {
			store.isLoading = false
		}
	}

	return { extract }
}

// ── Helpers ────────────────────────────────────────────────────

function startProgressSimulation() {
	const store = useTutorialStore()

	const messages = [
		"⟳ Sending to server...",
		"⟳ Preprocessing and normalizing text...",
		"⟳ Calling Gemini with structured prompt...",
		"⟳ Extracting steps and UI element hints...",
		"⟳ Validating JSON schema output...",
	]

	let i = 0

	return setInterval(() => {
		if (i < messages.length) {
			const message = messages[i]
			if (message !== undefined) {
				store.loadingMessage = message
				store.loadingProgress = Math.round(((i + 1) / (messages.length + 1)) * 90)
				i++
			}
		}
	}, 800)
}

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}
