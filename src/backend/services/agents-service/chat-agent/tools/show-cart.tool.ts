import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { PRODUCT_IDS } from '@/backend/domain/catalog'
import { UiService } from '@/backend/services/ui-service'

export class ShowCartTool {
	constructor(private readonly _uiService: UiService) {}

	public tool(): Tool {
		return tool({
			description: `
        Muestra una tarjeta interactiva para que el usuario elija bebidas, tamaño, topping y cantidad
        y simule una compra.

        Input: "productIds" (bebidas del catálogo a ofrecer).

        Úsala cuando el usuario quiera comprar bebidas. Todo es una simulación.
      `,
			inputSchema: z.object({
				productIds: z.array(z.enum(PRODUCT_IDS)).min(1).describe('Bebidas del catálogo a ofrecer'),
			}),
			execute: async ({ productIds }) => this._uiService.render('CartCard', { productIds }),
			toModelOutput: ({ output }) => ({ type: 'text', value: JSON.stringify(output.props) }),
		})
	}
}
