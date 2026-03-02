import { GoogleGenAI } from "@google/genai"

export default defineEventHandler(async (event) => {
    const {
        text, filename
    } = await readBody(event)

    const config = useRuntimeConfig()

    // VALIDATE INPUT
    if(!text || typeof text !== "string" || !text.trim()) {
        throw createError({
            statusCode: 400,
            message: "No text provided."
        })
    }

    // GRAB API KEY
    const apiKey = config.apiSecret;

    if(!apiKey) {
        throw createError({
            statusCode: 500,
            message: "LLM API key not set."
        })
    }

    const ai = new GoogleGenAI({
        apiKey
    })

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        config: {
            responseMimeType: "application/json",
        }, 
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text:  
                        `
                            You are a tutorial extraction engine for a tool called AnTrail.
                            Your job is to read a user manual and extract discrete, actionable
                            UI steps that a user would perform in a web application.

                            Return ONLY valid JSON matching this exact schema:
                            {
                            "tutorialTitle": "string — the name of this workflow",
                            "appName": "string — the name of the application if mentioned, otherwise 'Unknown App'",
                            "extractedFrom": "string — the filename passed to you",
                            "totalSteps": number,
                            "steps": [
                                {
                                "stepNumber": number,
                                "title": "string — short 3-5 word label",
                                "instruction": "string — clear instruction written directly to the user",
                                "uiElementHint": "string — describe the UI element (e.g. 'Save button, top-right corner')",
                                "elementType": "button | input | navigation | link | form | table",
                                "suggestedSelector": "string | null — best guess CSS selector",
                                "confirmedSelector": null,
                                "confidence": number between 0 and 1
                                }
                            ]
                            }

                            Rules:
                            - Only extract steps that describe a direct user action (click, type, select, navigate)
                            - Ignore introductory paragraphs, notes, warnings, and disclaimers
                            - Flatten nested sub-steps into separate top-level steps
                            - Write instructions in second person ("Click the Save button")
                            - If you cannot determine a CSS selector, set suggestedSelector to null
                            - Always set confirmedSelector to null
                            - Set confidence based on how clearly the step maps to a specific UI element

                            Filename: ${filename ?? "manual.txt"}

                            Manual text:
                            ${text}
                        `.trim(),
                    }
                ]
            }
        ]
    })

    const raw = response.text

    if(!raw) {
        throw createError({
            statusCode: 500,
            message: "Empty response from Gemini."
        })
    }

    try {
        const parsed = JSON.parse(raw)
        return parsed
    } catch {
        createError({
            statusCode: 500,
            message: "Gemini returned invalid JSON."
        })
    }
})