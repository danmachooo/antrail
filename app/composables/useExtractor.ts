// composables/useExtractor.ts
import { useTutorialStore } from "~/stores/tutorial"

export function useExtractor() {
	const store = useTutorialStore()

	// ── File upload path ─────────────────────────────────────────
	async function extract(file: File): Promise<boolean> {
		store.isLoading = true
		store.loadingProgress = 0
		store.loadingMessage = "⟳ Reading file..."
		store.fileName = file.name
		store.setStage("extracting")

		try {
			const progressInterval = startProgressSimulation()

			const formData = new FormData()
			formData.append("file", file)
			formData.append("filename", file.name)

			const result = await $fetch("/api/extract", {
				method: "POST",
				body: formData,
			})

			clearInterval(progressInterval)
			return finalize(result)
		} catch (err: any) {
			return handleError(err)
		} finally {
			store.isLoading = false
		}
	}

	// ── Pasted text path ─────────────────────────────────────────
	async function extractFromText(text: string, filename = "manual.txt"): Promise<boolean> {
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
			return finalize(result)
		} catch (err: any) {
			return handleError(err)
		} finally {
			store.isLoading = false
		}
	}

	// ── Shared helpers ────────────────────────────────────────────
	async function finalize(result: any): Promise<boolean> {
		store.loadingProgress = 100
		store.loadingMessage = "✓ Complete! Building step cards..."
		await delay(400)
		store.setTutorial(result)
		store.setStage("json")
		return true
	}

	function handleError(err: any): boolean {
		store.loadingMessage = `✗ Error: ${err?.data?.message ?? err?.message ?? "Something went wrong."}`
		store.loadingProgress = 0
		store.setStage("upload")
		return false
	}

	return { extract, extractFromText }
}

function startProgressSimulation() {
	const store = useTutorialStore()

	const messages = [
		"Sending to server...",
		"Preprocessing and normalizing text...",
		"Calling Groq with structured prompt...",
		"Extracting steps and UI element hints...",
		"Validating JSON schema output...",
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
