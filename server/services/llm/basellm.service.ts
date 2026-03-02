export abstract class BaseLLMService {
	protected model: string

	constructor(model: string) {
		this.model = model
	}

	/**
	 * Generate a plain text response from a prompt string.
	 */
	abstract generate(prompt: string): Promise<string>

	/**
	 * Generate a typed JSON response. Child classes can override
	 * for provider-native JSON mode (e.g. Gemini's responseMimeType).
	 */
	async generateJSON<T>(prompt: string): Promise<T> {
		const raw = await this.generate(prompt)
		try {
			return JSON.parse(raw) as T
		} catch {
			throw createError({ statusCode: 500, message: "LLM returned invalid JSON." })
		}
	}
}
