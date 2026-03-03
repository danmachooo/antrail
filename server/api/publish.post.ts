import { StatusCodes } from "http-status-codes"
import { withGlobalErrorHandler } from "#server/utils/error-handler"
import { savePublishedTutorial } from "#server/services/publish/published-tutorial.service"
import { publishTutorialSchema } from "#shared/schema/publish.schema"

function trimTrailingSlash(value: string): string {
	return value.endsWith("/") ? value.slice(0, -1) : value
}

export default defineEventHandler(
	withGlobalErrorHandler(
		async event => {
			const data = await readValidatedBody(event, publishTutorialSchema.safeParse)
			if (!data.success) {
				throw createError({
					statusCode: StatusCodes.BAD_REQUEST,
					message: data.error.message,
				})
			}

			const saved = await savePublishedTutorial(data.data.route, data.data.tutorial)

			const runtimeBase = useRuntimeConfig().public?.apiBase
			const origin = runtimeBase ? trimTrailingSlash(runtimeBase) : getRequestURL(event).origin
			const embedUrl = `${origin}/embed.js`
			const scriptTag = `<script src="${embedUrl}" data-token="${saved.token}"></script>`

			return {
				token: saved.token,
				route: saved.route,
				embedUrl,
				scriptTag,
			}
		},
		{
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			statusMessage: "Publish failed",
			message: "Unable to publish tutorial.",
		}
	)
)
