// server/helpers/extract.helpers.ts

import type { TutorialData } from "#shared/types/tutorial.types"
import { getLLMService } from "#server/services/llm/index.service"

export function buildPrompt(text: string, filename: string) {
	return `
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

Manual text: ${text}
`.trim()
}

export async function extractTutorial(text: string, filename: string): Promise<TutorialData> {
	const llm = getLLMService("gemini")
	return llm.generateJSON<TutorialData>(buildPrompt(text, filename))
}
