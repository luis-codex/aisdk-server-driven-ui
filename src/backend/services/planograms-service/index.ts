import { InternalServerError } from '@/backend/domain/errors'
import { SecretsService } from '@/backend/services/secrets-service'
import type { IGetPlanogramsByEan } from './types'

/** Cliente de la API de planogramas de Arcus. */
export class PlanogramsService {
	constructor(private readonly _secretsService: SecretsService) {}

	public async getByEan({ storeId, ean }: IGetPlanogramsByEan['request']) {
		const baseUrl = this._secretsService.getRequired('ARCUS_PLANOGRAMS_API_BASE_URL')
		const token = this._secretsService.getRequired('ARCUS_PLANOGRAMS_API_BEARER_TOKEN')
		const url = new URL('/products', baseUrl)
		url.searchParams.set('store_id', storeId)
		url.searchParams.set('ean', ean)
		const clientId = this._secretsService.get('CF_ACCESS_CLIENT_ID')
		const clientSecret = this._secretsService.get('CF_ACCESS_CLIENT_SECRET')
		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
				...(clientId && clientSecret
					? { 'CF-Access-Client-Id': clientId, 'CF-Access-Client-Secret': clientSecret }
					: {}),
			},
		})
		if (!response.ok) {
			throw new InternalServerError(`Planogramas respondió ${response.status} para el EAN ${ean}.`)
		}
		return (await response.json()) as IGetPlanogramsByEan['response']
	}
}
