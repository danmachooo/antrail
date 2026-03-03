import type { TutorialData, TutorialStep } from "#shared/types/tutorial.types"

type KnownSelectorRule = {
	all: string[]
	selector: string
	elementType: TutorialStep["elementType"]
}

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
	"button",
	"field",
	"input",
	"tab",
	"page",
	"screen",
])

const antrailSelectorRules: KnownSelectorRule[] = [
	{ all: ["upload"], selector: `[data-testid="upload-button"]`, elementType: "button" },
	{ all: ["file", "input"], selector: `[data-testid="manual-file-input"]`, elementType: "input" },
	{ all: ["extract", "ai"], selector: `[data-testid="extract-button"]`, elementType: "button" },
	{ all: ["paste", "manual"], selector: `[data-testid="manual-textarea"]`, elementType: "input" },
	{ all: ["sample", "manual"], selector: `[data-testid="load-sample-button"]`, elementType: "button" },
	{ all: ["copy", "json"], selector: `[data-testid="copy-json-button"]`, elementType: "button" },
	{ all: ["view", "step", "cards"], selector: `[data-testid="verify-button"]`, elementType: "button" },
	{ all: ["preview", "tutorial"], selector: `[data-testid="preview-button"]`, elementType: "button" },
	{ all: ["start", "tutorial"], selector: `[data-testid="start-preview-button"]`, elementType: "button" },
	{ all: ["skip", "export"], selector: `[data-testid="skip-export-button"]`, elementType: "button" },
	{ all: ["continue", "export"], selector: `[data-testid="continue-export-button"]`, elementType: "button" },
	{ all: ["publish", "embed"], selector: `[data-testid="publish-embed-button"]`, elementType: "button" },
	{ all: ["route", "pattern"], selector: `[data-testid="publish-route-input"]`, elementType: "input" },
	{ all: ["copy", "tag"], selector: `[data-testid="copy-tag-button"]`, elementType: "button" },
	{ all: ["copy", "snippet"], selector: `[data-testid="copy-snippet-button"]`, elementType: "button" },
	{ all: ["download"], selector: `[data-testid="download-driver-button"]`, elementType: "button" },
]

function normalizeText(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

function unique<T>(items: T[]): T[] {
	return [...new Set(items)]
}

function toKeywords(value: string): string[] {
	return normalizeText(value)
		.split(" ")
		.filter(word => word.length >= 3 && !stopWords.has(word))
}

function extractQuotedPhrases(value: string): string[] {
	const matches = value.match(/["'`][^"'`]{2,}["'`]/g) ?? []
	return matches.map(match => match.slice(1, -1).trim()).filter(Boolean)
}

function getKnownSelector(
	step: TutorialStep,
	selectorProfile: string
): { selector: string; elementType: TutorialStep["elementType"] } | null {
	if (selectorProfile !== "antrail") {
		return null
	}

	const haystack = normalizeText(`${step.title} ${step.instruction} ${step.uiElementHint}`)
	for (const rule of antrailSelectorRules) {
		const matched = rule.all.every(token => haystack.includes(token))
		if (matched) {
			return { selector: rule.selector, elementType: rule.elementType }
		}
	}
	return null
}

function inferTokens(step: TutorialStep): string[] {
	const source = normalizeText(`${step.uiElementHint} ${step.title} ${step.instruction}`)
	const sourceWords = source.split(" ").filter(word => word.length >= 3 && !stopWords.has(word))
	const quotedWords = unique(
		extractQuotedPhrases(`${step.instruction} ${step.uiElementHint} ${step.title}`).flatMap(phrase =>
			toKeywords(phrase)
		)
	)

	const preferred = unique([...quotedWords, ...sourceWords]).slice(0, 6)
	if (preferred.length === 0) return ["target"]
	return preferred
}

function escapeAttrValue(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

function isWeakSelector(selector: string): boolean {
	const normalized = selector.trim().toLowerCase()
	if (!normalized) return true
	if (normalized === "body" || normalized === "*" || normalized === "div" || normalized === "button") return true
	if (normalized.includes(":nth-child") || normalized.includes(":nth-of-type")) return true
	if (normalized.split(",").length > 8) return true
	return false
}

function sanitizeSelector(selector: string | null | undefined): string | null {
	if (!selector) return null
	const cleaned = selector
		.replace(/```(?:css)?/gi, "")
		.replace(/```/g, "")
		.trim()
	if (!cleaned || isWeakSelector(cleaned)) return null
	return cleaned
}

function buildSelectorCandidates(tag: string, token: string, extra: string[] = [], role?: string): string[] {
	const safe = escapeAttrValue(token)
	const candidates = [
		`[data-testid*="${safe}" i]`,
		`[data-cy*="${safe}" i]`,
		`[data-qa*="${safe}" i]`,
		`${tag}[id*="${safe}" i]`,
		`${tag}[name*="${safe}" i]`,
		`${tag}[aria-label*="${safe}" i]`,
		...extra.map(x => x.replaceAll("{token}", safe)),
	]

	if (role) {
		candidates.push(`[role="${role}"][aria-label*="${safe}" i]`)
	}

	return unique(candidates)
}

function normalizeElementType(value: string): TutorialStep["elementType"] {
	const normalized = value.toLowerCase()

	if (normalized.includes("select") || normalized.includes("dropdown") || normalized.includes("combobox"))
		return "select"
	if (normalized.includes("input") || normalized.includes("field") || normalized.includes("text")) return "input"
	if (normalized.includes("nav") || normalized.includes("menu") || normalized.includes("sidebar")) return "navigation"
	if (normalized.includes("link")) return "link"
	if (normalized.includes("form")) return "form"
	if (normalized.includes("table") || normalized.includes("grid")) return "table"
	if (normalized.includes("button") || normalized.includes("btn")) return "button"

	return "button"
}

function buildSelectorByType(elementType: TutorialStep["elementType"], token: string): string {
	switch (elementType) {
		case "button":
			return buildSelectorCandidates(
				"button",
				token,
				['input[type="button"][value*="{token}" i]', 'input[type="submit"][value*="{token}" i]'],
				"button"
			).join(", ")
		case "input":
			return buildSelectorCandidates("input", token, [
				'input[placeholder*="{token}" i]',
				'textarea[placeholder*="{token}" i]',
			]).join(", ")
		case "select":
			return buildSelectorCandidates("select", token, ['[role="combobox"][aria-label*="{token}" i]']).join(", ")
		case "navigation":
			return buildSelectorCandidates("a", token, [
				'nav a[href*="{token}" i]',
				'[role="navigation"] a[href*="{token}" i]',
			]).join(", ")
		case "link":
			return buildSelectorCandidates("a", token, ['a[href*="{token}" i]'], "link").join(", ")
		case "form":
			return buildSelectorCandidates("form", token).join(", ")
		case "table":
			return buildSelectorCandidates("table", token, [
				'[role="table"][aria-label*="{token}" i]',
				'[role="grid"][aria-label*="{token}" i]',
			]).join(", ")
		default:
			return buildSelectorCandidates("*", token).join(", ")
	}
}

export function ensureTutorialSelectors(tutorial: TutorialData, selectorProfile = "generic"): TutorialData {
	const normalizedProfile = selectorProfile.toLowerCase()

	const steps = tutorial.steps.map(step => {
		const knownSelector = getKnownSelector(step, normalizedProfile)
		const elementType = knownSelector?.elementType ?? normalizeElementType(String(step.elementType ?? ""))
		const existing = sanitizeSelector(step.suggestedSelector)
		const tokens = inferTokens(step)
		const fallbackSelectors = tokens.map(token => buildSelectorByType(elementType, token))
		const suggestedSelector =
			knownSelector?.selector ?? existing ?? fallbackSelectors[0] ?? buildSelectorByType(elementType, "target")

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
