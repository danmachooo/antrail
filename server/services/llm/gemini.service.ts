import { GoogleGenAI } from "@google/genai"
import { BaseLLMService } from "#server/services/llm/basellm.service"

export class GeminiService extends BaseLLMService {
	private client: GoogleGenAI

	constructor(client: GoogleGenAI, model = "gemini-2.0-flash") {
		super(model)
		this.client = client
	}

	async generate(prompt: string): Promise<string> {
		const response = await this.client.models.generateContent({
			model: this.model,
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		})

		const raw = response.text
		if (!raw) throw createError({ statusCode: 500, message: "Empty response from Gemini." })
		return raw
	}

	// Override to use Gemini's native JSON mode — more reliable than parsing free text
	override async generateJSON<T>(prompt: string): Promise<T> {
		const response = await this.client.models.generateContent({
			model: this.model,
			config: { responseMimeType: "application/json" },
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		})

		const raw = response.text
		if (!raw) throw createError({ statusCode: 500, message: "Empty response from Gemini." })

		try {
			return JSON.parse(raw) as T
		} catch {
			throw createError({ statusCode: 500, message: "Gemini returned invalid JSON." })
		}
	}
}
