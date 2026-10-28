import { InternalServerError } from '@/backend/domain/errors'

export class SecretsService {
	public get(key: string): string | null {
		return process.env[key] ?? null
	}

	public getRequired(key: string): string {
		const value = this.get(key)
		if (typeof value !== 'string' || value.trim().length === 0) {
			throw new InternalServerError(`El secreto ${key} es requerido.`)
		}
		return value
	}
}
