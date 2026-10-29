import { timingSafeEqual } from 'node:crypto'

/** Valida API keys configuradas en API_KEYS (separadas por coma). */
export class ApiKeyAuthService {
	private readonly _keys: string[]

	constructor(value = process.env.API_KEYS ?? '') {
		this._keys = value
			.split(',')
			.map((key) => key.trim())
			.filter(Boolean)
	}

	public authorize(request: Request): Response | undefined {
		const candidate = request.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1] ?? ''
		const candidateBytes = new TextEncoder().encode(candidate)
		let valid = false
		for (const key of this._keys) {
			const keyBytes = new TextEncoder().encode(key)
			if (keyBytes.byteLength === candidateBytes.byteLength) {
				valid = timingSafeEqual(keyBytes, candidateBytes) || valid
			}
		}
		if (valid) return undefined
		return Response.json({ message: 'Unauthorized' }, { status: 401 })
	}
}
