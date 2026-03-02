import z from "zod"

export const manualSchema = z.object({
	text: z.string().min(10, "Please enter a valid manual."),
	filename: z.string().min(3, "Valid filename must 3 or more characters long."),
})

export type ManualSchemaInput = z.infer<typeof manualSchema>
