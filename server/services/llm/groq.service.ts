import { BaseLLMService } from "#server/services/llm/basellm.service"

type GroqMessage = {
	content?: string
}

type GroqChoice = {
	message?: GroqMessage
}

type GroqResponse = {
	choices?: Array<GroqChoice>
}

type GroqErrorPayload = {
	error?: {
		message?: string
		type?: string
		code?: string
	}
}

export class GroqService extends BaseLLMService {
	private apiKey: string

	constructor(apiKey: string, model = "llama-3.1-8b-instant") {
		super(model)
		this.apiKey = apiKey
	}

	private async throwMappedError(response: Response): Promise<never> {
		const rawBody = await response.text()
		let payload: GroqErrorPayload | null = null
		if (rawBody) {
			try {
				payload = JSON.parse(rawBody) as GroqErrorPayload
			} catch {
				payload = null
			}
		}

		const providerMessage = payload?.error?.message

		if (response.status === 429) {
			throw createError({
				statusCode: 429,
				statusMessage: "LLM quota exceeded",
				message: providerMessage ?? "Groq rate limit or quota exceeded. Retry later.",
				data: { provider: "groq" },
			})
		}

		if (response.status >= 400 && response.status < 500) {
			throw createError({
				statusCode: 400,
				statusMessage: "Invalid request to LLM provider",
				message: providerMessage ?? "Groq rejected the request.",
				data: { provider: "groq", providerStatus: response.status },
			})
		}

		throw createError({
			statusCode: 502,
			statusMessage: "LLM provider unavailable",
			message: providerMessage ?? "Groq service is temporarily unavailable.",
			data: { provider: "groq", providerStatus: response.status },
		})
	}

	async generate(prompt: string): Promise<string> {
		const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: this.model,
				messages: [{ role: "user", content: prompt }],
				temperature: 0,
			}),
		})

		if (!response.ok) {
			await this.throwMappedError(response)
		}

		const body = (await response.json()) as GroqResponse
		const text = body.choices?.[0]?.message?.content

		if (!text) {
			throw createError({ statusCode: 500, message: "Empty response from Groq." })
		}

		return text
	}

	private parsePossiblyWrappedJson<T>(raw: string): T {
		try {
			return JSON.parse(raw) as T
		} catch {
			// Common LLM behavior: wrap JSON in ```json ... ```
			const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1]
			if (fenced) {
				return JSON.parse(fenced) as T
			}

			// Fallback: extract first JSON object block.
			const start = raw.indexOf("{")
			const end = raw.lastIndexOf("}")
			if (start !== -1 && end !== -1 && end > start) {
				const slice = raw.slice(start, end + 1)
				return JSON.parse(slice) as T
			}

			throw createError({ statusCode: 500, message: "Groq returned invalid JSON." })
		}
	}

	override async generateJSON<T>(prompt: string): Promise<T> {
		const strictPrompt = `${prompt}\n\nImportant: Return only valid raw JSON. Do not include markdown code fences or explanations.`
		const raw = await this.generate(strictPrompt)
		return this.parsePossiblyWrappedJson<T>(raw)
	}
}
