// server/api/extract.post.ts
import { extractTutorial } from "#server/helpers/extract.helpers"
import { manualSchema } from "#shared/schema/manual.schema"
import type { ManualSchemaInput } from "#shared/schema/manual.schema"
import { StatusCodes } from "http-status-codes"

export default defineEventHandler(async event => {
	const data = await readValidatedBody(event, manualSchema.safeParse)

	if (!data.success) {
		throw createError({
			statusCode: StatusCodes.BAD_REQUEST,
			message: data.error.message,
		})
	}
	const manual = data.data as ManualSchemaInput

	try {
		const tutorial = await extractTutorial(manual)
		return tutorial
	} catch (error) {
		if ((error as { statusCode?: number })?.statusCode) throw error
		throw createError({
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			statusMessage: "Tutorial extraction failed",
			message: "Unexpected error while extracting tutorial data.",
		})
	}
})
