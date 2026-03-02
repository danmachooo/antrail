// server/helpers/extract.helpers.ts

import type { TutorialData } from "#shared/types/tutorial.types"
import { getLLMService } from "#server/services/llm/index.service"
import type { ManualSchemaInput } from "#shared/schema/manual.schema"

export function buildPrompt(manual: ManualSchemaInput) {
  return `
You are a tutorial extraction engine for AnTrail.
Extract clear, actionable UI steps from a user manual for a web app.

Return ONLY valid JSON in this exact shape:
{
  "tutorialTitle": "string",
  "appName": "string (or 'Unknown App')",
  "extractedFrom": "string (filename)",
  "totalSteps": number,
  "steps": [
    {
      "stepNumber": number,
      "title": "3-5 word label",
      "instruction": "Second-person action (e.g., 'Click the Save button')",
      "uiElementHint": "Describe the UI element and location",
      "elementType": "button | input | navigation | link | form | table",
      "suggestedSelector": "string | null",
      "confirmedSelector": null,
      "confidence": number (0-1)
    }
  ]
}

Rules:
- Include ONLY direct user actions (click, type, select, navigate).
- Ignore intros, notes, warnings, and disclaimers.
- Flatten nested steps into separate top-level steps.
- Use second person.
- If selector is unclear, set suggestedSelector to null.
- Always set confirmedSelector to null.
- Confidence reflects clarity of UI mapping.

Filename: ${manual.filename ?? "manual.txt"}
Manual:
${manual.text}
`.trim()
}

export async function extractTutorial(manual: ManualSchemaInput): Promise<TutorialData> {
	const llm = getLLMService("gemini")
	return llm.generateJSON<TutorialData>(buildPrompt(manual))
}
