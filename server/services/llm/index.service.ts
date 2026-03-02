import { GoogleGenAI } from "@google/genai"
import { GeminiService } from "#server/services/llm/gemini.service"
import { GroqService } from "#server/services/llm/groq.service"

function getGeminiClient() {
	const config = useRuntimeConfig()
	const apiKey = config.geminiApiKey
	if (!apiKey) throw createError({ statusCode: 500, message: "Gemini API key not set." })
	return new GoogleGenAI({ apiKey })
}

function getGroqService() {
	const config = useRuntimeConfig()
	const apiKey = config.groqApiKey
	if (!apiKey) throw createError({ statusCode: 500, message: "Groq API key not set." })
	return new GroqService(apiKey, config.groqModel)
}

type Provider = "gemini" | "groq"

export function getLLMService(provider: Provider = "groq") {
	switch (provider) {
		case "gemini":
			return new GeminiService(getGeminiClient())
		case "groq":
			return getGroqService()
		default:
			throw createError({ statusCode: 500, message: `Unknown LLM provider: ${provider}` })
	}
}
