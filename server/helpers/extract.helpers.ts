import { getLLMService } from "#server/services/llm/index.service"
import type { ManualSchemaInput } from "#shared/schema/manual.schema"
import type { TutorialData, TutorialStep } from "#shared/types/tutorial.types"

function normalizeText(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

function inferToken(step: TutorialStep): string {
	const source = normalizeText(`${step.uiElementHint} ${step.title} ${step.instruction}`)
	const stopWords = new Set([
		"the",
		"a",
		"an",
		"to",
		"of",
		"and",
		"or",
		"for",
		"from",
		"in",
		"on",
		"at",
		"with",
		"click",
		"enter",
		"select",
		"type",
		"open",
		"go",
		"navigate",
	])

	const words = source.split(" ").filter(word => word.length >= 3 && !stopWords.has(word))

	if (words.length === 0) return "target"
	return words.slice(0, 2).join("-")
}

function normalizeElementType(value: string): TutorialStep["elementType"] {
	const normalized = value.toLowerCase()

	if (normalized.includes("select") || normalized.includes("dropdown") || normalized.includes("combobox")) {
		return "select"
	}
	if (normalized.includes("input") || normalized.includes("field") || normalized.includes("text")) {
		return "input"
	}
	if (normalized.includes("nav") || normalized.includes("menu") || normalized.includes("sidebar")) {
		return "navigation"
	}
	if (normalized.includes("link")) {
		return "link"
	}
	if (normalized.includes("form")) {
		return "form"
	}
	if (normalized.includes("table") || normalized.includes("grid")) {
		return "table"
	}
	if (normalized.includes("button") || normalized.includes("btn")) {
		return "button"
	}

	return "button"
}

function buildSelectorByType(elementType: TutorialStep["elementType"], token: string): string {
	switch (elementType) {
		case "button":
			return `button[data-testid*="${token}" i], button[id*="${token}" i], button[name*="${token}" i], button[aria-label*="${token}" i], [role="button"][aria-label*="${token}" i]`
		case "input":
			return `input[name*="${token}" i], input[id*="${token}" i], input[placeholder*="${token}" i], textarea[name*="${token}" i], textarea[id*="${token}" i]`
		case "select":
			return `select[name*="${token}" i], select[id*="${token}" i], [role="combobox"][aria-label*="${token}" i]`
		case "navigation":
			return `nav a[href*="${token}" i], [data-testid*="${token}" i], [aria-label*="${token}" i]`
		case "link":
			return `a[href*="${token}" i], a[id*="${token}" i], a[aria-label*="${token}" i], [data-testid*="${token}" i]`
		case "form":
			return `form[id*="${token}" i], form[name*="${token}" i], [data-testid*="${token}" i]`
		case "table":
			return `table[id*="${token}" i], table[aria-label*="${token}" i], [data-testid*="${token}" i]`
		default:
			return `[data-testid*="${token}" i], [id*="${token}" i], [aria-label*="${token}" i]`
	}
}

function ensureSelectors(tutorial: TutorialData): TutorialData {
	const steps = tutorial.steps.map(step => {
		const elementType = normalizeElementType(String(step.elementType ?? ""))
		const existing = step.suggestedSelector?.trim()
		const suggestedSelector =
			existing && existing.length > 0 ? existing : buildSelectorByType(elementType, inferToken(step))

		return {
			...step,
			elementType,
			suggestedSelector,
		}
	})

	return {
		...tutorial,
		totalSteps: steps.length,
		steps,
	}
}

export function buildPrompt(manual: ManualSchemaInput) {
	return `
You are a tutorial extraction engine for a tool called AnTrail.
Read a user manual and extract discrete UI actions for a web application.

Return ONLY valid JSON in this exact shape:
{
  "tutorialTitle": "string",
  "appName": "string (or 'Unknown App')",
  "extractedFrom": "string",
  "totalSteps": number,
  "steps": [
    {
      "stepNumber": number,
      "title": "3-5 word label",
      "instruction": "Second-person action",
      "uiElementHint": "UI element description and location",
      "elementType": "button | input | select | navigation | link | form | table",
      "suggestedSelector": "string (best CSS selector)",
      "confirmedSelector": null,
      "confidence": number
    }
  ]
}

Rules:
- Include only direct user actions (click, type, select, navigate).
- Ignore intros, notes, warnings, and troubleshooting.
- Flatten nested steps into top-level ordered steps.
- Write instructions in second person.
- suggestedSelector must not be null.
- suggestedSelector must be a valid querySelector-compatible CSS selector.
- Prefer stable selectors in this order:
  1. [data-testid], [data-cy], [data-qa]
  2. #id and [name]
  3. [aria-label] and role-based attributes
  4. Type selectors like button/input/select with attribute filters
- Avoid brittle selectors like :nth-child and deep chained class selectors.
- Always set confirmedSelector to null.
- Confidence is between 0 and 1.

Filename: ${manual.filename ?? "manual.txt"}
Manual:
${manual.text}
`.trim()
}

export async function extractTutorial(manual: ManualSchemaInput): Promise<TutorialData> {
	const llm = getLLMService("groq")
	const tutorial = await llm.generateJSON<TutorialData>(buildPrompt(manual))
	return ensureSelectors(tutorial)
}
