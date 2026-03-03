import { StatusCodes } from "http-status-codes"
import { withGlobalErrorHandler } from "#server/utils/error-handler"
import { getPublishedTutorial } from "#server/services/publish/published-tutorial.service"

export default defineEventHandler(
	withGlobalErrorHandler(
		async event => {
			const token = getRouterParam(event, "token")
			if (!token) {
				throw createError({
					statusCode: StatusCodes.BAD_REQUEST,
					message: "Missing tutorial token.",
				})
			}

			const published = await getPublishedTutorial(token)
			if (!published) {
				throw createError({
					statusCode: StatusCodes.NOT_FOUND,
					message: "Published tutorial not found.",
				})
			}

			return {
				route: published.route,
				tutorial: published.tutorial,
			}
		},
		{
			statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			statusMessage: "Tutorial lookup failed",
			message: "Unable to load published tutorial.",
		}
	)
)
