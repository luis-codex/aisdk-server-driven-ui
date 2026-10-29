import { tool, type Tool } from 'ai'
import { z } from 'zod'
import type { PlanogramItem } from '@/backend/components/planogram-list'
import { PlanogramsService } from '@/backend/services/planograms-service'
import type { IPlanogramRecord } from '@/backend/services/planograms-service/types'
import { UiService } from '@/backend/services/ui-service'

type Obj = Record<string, unknown>

const asObj = (value: unknown): Obj => (value && typeof value === 'object' ? (value as Obj) : {})
const asText = (value: unknown): string | undefined =>
	typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
const pick = (...values: unknown[]) => values.map(asText).find((v) => v !== undefined)

export class GetPlanogramsTool {
	constructor(
		private readonly _planogramsService: PlanogramsService,
		private readonly _uiService: UiService
	) {}

	public tool(): Tool {
		return tool({
			description: `
        Consulta los PLANOGRAMAS (documentos con la ubicación y distribución física de un producto en
        la góndola) de una tienda a partir de códigos EAN.

        Input: "storeId" (id de la tienda, ej. J510) y "eans" (códigos de barras, hasta 20). Si solo
        tienes nombres de productos, primero obtén sus EAN con searchArticles.

        Devuelve una lista compacta en pantalla donde el usuario puede destacar un planograma o abrirlo
        en otra pestaña; no la repitas. No busca ni compara productos y no devuelve stock ni precios.

        Úsala solo cuando el usuario pida planogramas o saber dónde se ubica o exhibe un producto.
        No la uses para buscar, listar o encontrar productos similares: para eso usa searchArticles.
        Si falta la tienda, pídela antes de llamar.
      `,
			inputSchema: z.object({
				storeId: z.string().min(1).describe('ID de la tienda'),
				eans: z.array(z.string().min(4)).min(1).max(20).describe('Códigos EAN a consultar'),
			}),
			execute: async ({ storeId, eans }) => {
				const unique = [...new Set(eans)]
				const results = await Promise.allSettled(
					unique.map((ean) => this._planogramsService.getByEan({ storeId, ean }))
				)
				const planograms = new Map<string, PlanogramItem>()
				const notFoundEans: string[] = []
				const failedEans: string[] = []
				results.forEach((result, i) => {
					const ean = unique[i]!
					if (result.status === 'rejected') {
						console.error(`[GetPlanogramsTool] Error consultando el EAN ${ean}: ${result.reason}`)
						failedEans.push(ean)
						return
					}
					if (result.value.length === 0) notFoundEans.push(ean)
					for (const [k, record] of result.value.entries()) {
						const item = this._toItem(record, `${ean}-${k}`)
						const existing = planograms.get(item.id)
						if (existing) existing.eans.push(ean)
						else planograms.set(item.id, { ...item, eans: [ean] })
					}
				})
				if (planograms.size === 0 && failedEans.length === unique.length) {
					return 'No fue posible consultar los planogramas. Intenta nuevamente más tarde.'
				}
				return {
					...this._uiService.render('PlanogramList', {
						planograms: [...planograms.values()],
						notFoundEans,
					}),
					failedEans,
				}
			},
			// El modelo recibe los datos, nunca el HTML.
			toModelOutput: ({ output }) => ({
				type: 'text',
				value:
					typeof output === 'string'
						? output
						: `Lista mostrada al usuario. ${JSON.stringify({ ...output.props, failedEans: output.failedEans })}`,
			}),
		})
	}

	/** La API no documenta su esquema: se toman los campos habituales y se ignora el resto. */
	private _toItem(record: IPlanogramRecord, fallbackId: string): PlanogramItem {
		const file = asObj(record.file)
		const store = asObj(record.store)
		const category = asObj(record.category)
		const section = asObj(category.section ?? record.section)
		const shelf = asObj(record.shelf)
		return {
			id: pick(record.id, record._id, record.planogram_id) ?? fallbackId,
			eans: [],
			name: pick(record.name, file.name, shelf.name, category.name) ?? 'Planograma',
			store: pick(store.name, store.description, record.store),
			section: pick(section.name, record.section),
			shelf: pick(shelf.name, record.shelf),
			status: pick(record.status),
			deadline: pick(record.deadline_date),
			url: pick(file.url, record.url, record.pdf_url, record.file_url),
		}
	}
}
