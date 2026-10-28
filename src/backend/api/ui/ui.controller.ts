import { UiService } from '@/backend/services/ui-service'

export class UiController {
	constructor(private readonly _uiService: UiService) {}

	/** Sirve el módulo de un componente para que el navegador lo importe e hidrate. */
	public find(file: string): Response {
		const module = this._uiService.findModule(file)
		if (!module) return new Response('Not found', { status: 404 })
		return new Response(module, { headers: { 'content-type': 'text/javascript' } })
	}
}
