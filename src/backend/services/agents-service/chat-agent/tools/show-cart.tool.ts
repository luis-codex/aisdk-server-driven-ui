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

        Úsala solo cuando el usuario pida comprar o elegir bebidas, no para preguntas informativas. Todo es una simulación.
      `,
			inputSchema: z.object({
				productIds: z.array(z.enum(PRODUCT_IDS)).min(1).describe('Bebidas del catálogo a ofrecer'),
			}),
			execute: async ({ productIds }) => this._uiService.render('CartCard', { productIds }),
			// La tarjeta es interactiva: el modelo debe saber que está abierta y esperando la elección.
			toModelOutput: ({ output }) => ({
				type: 'text',
				value: `Tarjeta interactiva mostrada al usuario con ${JSON.stringify(output.props.productIds)}. Espera su elección: llegará como un mensaje del usuario.`,
			}),
		})
	}
}
