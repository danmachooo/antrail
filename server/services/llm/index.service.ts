import { GoogleGenAI } from "@google/genai"
import { GeminiService } from "#server/services/llm/gemini.service"
import { GroqService } from "#server/services/llm/groq.service"
import { StatusCodes } from "http-status-codes"

function getGeminiClient() {
	const config = useRuntimeConfig()
	const apiKey = config.geminiApiKey
	if (!apiKey)
		throw createError({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, message: "Gemini API key not set." })
	return new GoogleGenAI({ apiKey })
}

function getGroqService() {
	const config = useRuntimeConfig()
	const apiKey = config.groqApiKey
	if (!apiKey) throw createError({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, message: "Groq API key not set." })
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
			throw createError({
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				message: `Unknown LLM provider: ${provider}`,
			})
	}
}
