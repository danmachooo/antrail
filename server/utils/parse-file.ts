import mammoth from "mammoth"
import { PDFParse } from "pdf-parse"
import { StatusCodes } from "http-status-codes"
import { isHandledError } from "#server/utils/error-handler"

const PDF_MIME_TYPE = "application/pdf"
const DOCX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

function normalizeText(text: string): string {
	return text
		.replace(/\r\n/g, "\n")
		.split("\0")
		.join("")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.trim()
}

async function parsePdfText(buffer: Buffer): Promise<string> {
	const parser = new PDFParse({ data: buffer })

	try {
		// Text only: no image extraction for manuals.
		const result = await parser.getText()
		return normalizeText(result.text ?? "")
	} finally {
		await parser.destroy()
	}
}

async function parseDocxText(buffer: Buffer): Promise<string> {
	// extractRawText only reads textual content.
	const result = await mammoth.extractRawText({ buffer })
	return normalizeText(result.value)
}

function throwUnsupportedTypeError(mimetype: string): never {
	throw createError({
		statusCode: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
		statusMessage: "Unsupported file type",
		message: `Only PDF and DOCX files are supported. Received: ${mimetype || "unknown"}.`,
	})
}

export async function parseFile(buffer: Buffer, mimetype: string): Promise<string> {
	if (!buffer.length) {
		throw createError({
			statusCode: StatusCodes.BAD_REQUEST,
			statusMessage: "Empty file",
			message: "Uploaded file is empty.",
		})
	}

	try {
		if (mimetype === PDF_MIME_TYPE) {
			return await parsePdfText(buffer)
		}

		if (mimetype === DOCX_MIME_TYPE) {
			return await parseDocxText(buffer)
		}

		throwUnsupportedTypeError(mimetype)
	} catch (error) {
		if (isHandledError(error)) throw error

		throw createError({
			statusCode: StatusCodes.BAD_REQUEST,
			statusMessage: "Failed to parse file",
			message: "The uploaded file could not be parsed as text.",
			data: { mimetype },
		})
	}
}
