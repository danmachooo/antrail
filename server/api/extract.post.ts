// server/api/extract.post.ts
import { extractTutorial } from "#server/helpers/extract.helpers"
import { manualSchema } from "~~/shared/schema/manual.schema"

export default defineEventHandler(async event => {
	const { text, filename } = manualSchema.parse(event)

	const tutorial = await extractTutorial(text, filename ?? "manual.txt")
	return tutorial
})
