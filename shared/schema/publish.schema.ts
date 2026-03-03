import z from "zod"

export const publishTutorialSchema = z.object({
	route: z
		.string()
		.trim()
		.min(1, "Route is required.")
		.transform(route => {
			if (route.startsWith("/")) return route
			return `/${route}`
		}),
	tutorial: z.object({
		tutorialTitle: z.string(),
		appName: z.string(),
		extractedFrom: z.string(),
		totalSteps: z.number(),
		steps: z
			.array(
				z.object({
					stepNumber: z.number(),
					title: z.string(),
					instruction: z.string(),
					uiElementHint: z.string(),
					elementType: z.enum(["button", "input", "select", "navigation", "link", "form", "table"]),
					suggestedSelector: z.string().nullable(),
					confirmedSelector: z.string().nullable(),
					confidence: z.number(),
				})
			)
			.min(1, "Tutorial must include at least one step."),
	}),
})

export type PublishTutorialInput = z.infer<typeof publishTutorialSchema>
