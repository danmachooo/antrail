import { GoogleGenAI } from "@google/genai"
import { BaseLLMService } from "#server/services/llm/basellm.service"
import { isHandledError } from "#server/utils/error-handler"
import { StatusCodes } from "http-status-codes"

type GeminiErrorDetail = {
	retryDelay?: string
}

type GeminiErrorPayload = {
	error?: {
		code?: number
		message?: string
		status?: string
		details?: Array<GeminiErrorDetail>
	}
}

export class GeminiService extends BaseLLMService {
	private client: GoogleGenAI

	constructor(client: GoogleGenAI, model = "gemini-2.0-flash") {
		super(model)
		this.client = client
	}

	private parseErrorMessage(message?: string): GeminiErrorPayload | null {
		if (!message) return null
		try {
			return JSON.parse(message) as GeminiErrorPayload
		} catch {
			return null
		}
	}

	private getRetryAfterSeconds(payload: GeminiErrorPayload | null): number | null {
		const details = payload?.error?.details
		if (!details?.length) return null

		for (const detail of details) {
			if (!detail.retryDelay) continue
			const seconds = Number.parseInt(detail.retryDelay.replace("s", ""), 10)
			if (!Number.isNaN(seconds)) return seconds
		}

		return null
	}

	private throwMappedError(error: unknown): never {
		if (isHandledError(error)) {
			throw error
		}

		const apiError = error as { status?: number; message?: string }
		const status = apiError?.status
		const payload = this.parseErrorMessage(apiError?.message)

		if (status === StatusCodes.TOO_MANY_REQUESTS) {
			const retryAfterSeconds = this.getRetryAfterSeconds(payload)
			throw createError({
				statusCode: StatusCodes.TOO_MANY_REQUESTS,
				statusMessage: "LLM quota exceeded",
				message: retryAfterSeconds
					? `Gemini quota exceeded. Retry after ${retryAfterSeconds}s or update API billing/quota settings.`
					: "Gemini quota exceeded. Retry later or update API billing/quota settings.",
				data: { provider: "gemini", retryAfterSeconds },
			})
		}

		if (status && status >= StatusCodes.BAD_REQUEST && status < StatusCodes.INTERNAL_SERVER_ERROR) {
			throw createError({
				statusCode: StatusCodes.BAD_REQUEST,
				statusMessage: "Invalid request to LLM provider",
				message: payload?.error?.message ?? "Gemini rejected the request.",
				data: { provider: "gemini", providerStatus: status },
			})
		}

		if (status && status >= StatusCodes.INTERNAL_SERVER_ERROR) {
			throw createError({
				statusCode: 502,
				statusMessage: "LLM provider unavailable",
				message: "Gemini service is temporarily unavailable.",
				data: { provider: "gemini", providerStatus: status },
			})
		}

		throw createError({
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			statusMessage: "LLM request failed",
			message: "Unexpected error while calling Gemini.",
			data: { provider: "gemini" },
		})
	}

	async generate(prompt: string): Promise<string> {
		try {
			const response = await this.client.models.generateContent({
				model: this.model,
				contents: [{ role: "user", parts: [{ text: prompt }] }],
			})

			const raw = response.text
			if (!raw) throw createError({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, message: "Empty response from Gemini." })
			return raw
		} catch (error) {
			this.throwMappedError(error)
		}
	}

	// Override to use Gemini's native JSON mode; more reliable than parsing free text.
	override async generateJSON<T>(prompt: string): Promise<T> {
		try {
			const response = await this.client.models.generateContent({
				model: this.model,
				config: { responseMimeType: "application/json" },
				contents: [{ role: "user", parts: [{ text: prompt }] }],
			})

			const raw = response.text
			if (!raw) throw createError({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, message: "Empty response from Gemini." })

			try {
				return JSON.parse(raw) as T
			} catch {
				throw createError({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, message: "Gemini returned invalid JSON." })
			}
		} catch (error) {
			this.throwMappedError(error)
		}
	}
}
