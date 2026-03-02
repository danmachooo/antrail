export type ElementType = "button" | "input" | "navigation" | "link" | "form" | "table"

export interface TutorialStep {
	stepNumber: number
	title: string
	instruction: string
	uiElementHint: string
	elementType: ElementType
	suggestedSelector: string | null
	confirmedSelector: string | null
	confidence: number
}

export interface TutorialData {
	tutorialTitle: string
	appName: string
	extractedFrom: string
	totalSteps: number
	steps: TutorialStep[]
}
