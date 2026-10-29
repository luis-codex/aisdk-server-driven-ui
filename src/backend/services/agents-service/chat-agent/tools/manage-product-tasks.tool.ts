import { tool, type Tool } from 'ai'
import { z } from 'zod'
import type { ProductTasksService } from '@/backend/services/product-tasks-service'
import type { UiService } from '@/backend/services/ui-service'

export class ManageProductTasksTool {
	constructor(
		private readonly _tasks: ProductTasksService,
		private readonly _ui: UiService
	) {}

	public tool(): Tool {
		return tool({
			description: `Abre y avanza el flujo interactivo simulado para gestionar tareas de productos. Úsala cuando el usuario quiera gestionar tareas pendientes. Inicia con phase "gerencia"; después de cada decisión recibida como mensaje del usuario, llama otra vez con phase "categorias", "productos" o "evidencia" según corresponda. Al elegir categoría incluye categoryId; al elegir producto incluye categoryId y productId. Cuando el usuario finalice con o sin foto, llama phase "productos" con completedProductId para marcarla gestionada y mostrar la lista restante.`,
			inputSchema: z.object({
				phase: z.enum(['gerencia', 'categorias', 'productos', 'evidencia']),
				categoryId: z.string().optional(),
				productId: z.string().optional(),
				completedProductId: z.string().optional(),
			}),
			execute: async ({ phase, categoryId, productId, completedProductId }) => {
				const resolvedCategoryId =
					categoryId ??
					(completedProductId && this._tasks.categoryIdForProduct(completedProductId)) ??
					(productId && this._tasks.categoryIdForProduct(productId))
				if (completedProductId) this._tasks.complete(completedProductId)
				const categories = this._tasks.categories()
				const category = resolvedCategoryId
					? categories.find((item) => item.id === resolvedCategoryId)
					: undefined
				const product = productId
					? resolvedCategoryId
						? this._tasks.products(resolvedCategoryId).find((item) => item.id === productId)
						: undefined
					: undefined
				return this._ui.render('ProductTaskManager', {
					phase,
					categories,
					category,
					products: resolvedCategoryId ? this._tasks.products(resolvedCategoryId) : [],
					product,
					completed: Boolean(completedProductId),
				})
			},
			toModelOutput: ({ output }) => ({
				type: 'text',
				value: `Flujo interactivo de tareas mostrado (paso ${output.props.phase}). Contexto y opciones de UI: ${JSON.stringify(output.props)}. La UI espera la decisión del usuario, que llegará como su siguiente mensaje.`,
			}),
		})
	}
}
