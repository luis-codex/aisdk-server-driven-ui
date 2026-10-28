export class InvalidError extends Error {
	public readonly statusCode = 400
}

export class InternalServerError extends Error {
	public readonly statusCode = 500
}
