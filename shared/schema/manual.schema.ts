import z from "zod"

export const manualSchema = z.object({
	text: z.string().min(10, "Please enter a valid manual."),
	filename: z.string().trim().min(1).optional(),
})

export type ManualSchemaInput = z.infer<typeof manualSchema>
