
import { GoogleGenAI } from "@google/genai"
import { GeminiService } from "#server/services/llm/gemini.service"
// import library here if mag switch ng model if ever

export function getAIClient() {
	const config = useRuntimeConfig()
	const apiKey = config.apiSecret
	if (!apiKey) throw createError({ statusCode: 500, message: "LLM API key not set." })
	return new GoogleGenAI({ apiKey })
}

type Provider = "gemini" // | 'openai'

export function getLLMService(provider: Provider = "gemini") {
	switch (provider) {
		case "gemini":
			return new GeminiService(getAIClient())
		default:
			throw createError({ statusCode: 500, message: `Unknown LLM provider: ${provider}` })
	}
}
