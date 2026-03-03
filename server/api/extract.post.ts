// server/api/extract.post.ts
import { extractTutorial } from "#server/services/tutorial/extract.service"
import { withGlobalErrorHandler } from "#server/utils/error-handler"
import { parseFile } from "#server/utils/parse-file"
import { manualSchema } from "#shared/schema/manual.schema"
import type { ManualSchemaInput } from "#shared/schema/manual.schema"
import { StatusCodes } from "http-status-codes"

export default defineEventHandler(
	withGlobalErrorHandler(
		async event => {
			const contentType = getHeader(event, "content-type") ?? ""
			let manual: ManualSchemaInput

			if (contentType.includes("multipart/form-data")) {
				const parts = await readMultipartFormData(event)
				if (!parts?.length) {
					throw createError({
						statusCode: StatusCodes.BAD_REQUEST,
						message: "No upload data received.",
					})
				}

				const filePart = parts.find(part => part.name === "file")
				if (!filePart?.data?.length) {
					throw createError({
						statusCode: StatusCodes.BAD_REQUEST,
						message: "Uploaded file is missing.",
					})
				}

				const parsedText = await parseFile(filePart.data, filePart.type ?? "")
				const filenamePart = parts.find(part => part.name === "filename")
				const filename = filenamePart?.data?.toString("utf-8") || filePart.filename || "manual.txt"
				manual = { text: parsedText, filename }
			} else {
				const data = await readValidatedBody(event, manualSchema.safeParse)

				if (!data.success) {
					throw createError({
						statusCode: StatusCodes.BAD_REQUEST,
						message: data.error.message,
					})
				}

				manual = data.data as ManualSchemaInput
			}

			return extractTutorial(manual)
		},
		{
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			statusMessage: "Tutorial extraction failed",
			message: "Unexpected error while extracting tutorial data.",
		}
	)
)
