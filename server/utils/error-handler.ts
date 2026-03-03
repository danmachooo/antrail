import { StatusCodes } from "http-status-codes"
import type { H3Event } from "h3"

export type ErrorFallback = {
	statusCode?: number
	statusMessage?: string
	message?: string
	data?: Record<string, unknown>
}

type HandledError = ReturnType<typeof createError>

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null
}

export function isHandledError(error: unknown): error is HandledError {
	if (!isObject(error)) return false
	return typeof error.statusCode === "number"
}

export function toHandledError(error: unknown, fallback: ErrorFallback = {}): HandledError {
	if (isHandledError(error)) {
		return error
	}

	const errorMessage = error instanceof Error ? error.message : "Unexpected server error."
	return createError({
		statusCode: fallback.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR,
		statusMessage: fallback.statusMessage ?? "Internal Server Error",
		message: fallback.message ?? errorMessage,
		data: fallback.data,
	})
}

export function withGlobalErrorHandler<TEvent extends H3Event, TResult>(
	handler: (event: TEvent) => Promise<TResult>,
	fallback?: ErrorFallback
) {
	return async (event: TEvent): Promise<TResult> => {
		try {
			return await handler(event)
		} catch (error) {
			throw toHandledError(error, fallback)
		}
	}
}
