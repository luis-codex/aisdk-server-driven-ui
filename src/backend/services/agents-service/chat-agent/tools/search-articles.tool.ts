import { createMCPClient, type MCPClient } from '@ai-sdk/mcp'
import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { SecretsService } from '@/backend/services/secrets-service'

const DIACRITICS = /\p{Diacritic}/gu
const LEADING_ASTERISKS = /^\*+/

interface IArticle {
	sku: string
	ean: string
	properties?: {
		description?: { name?: string; longName?: string; description?: string }
	}
}

interface IAggregateResult {
	items?: IArticle[]
	aggs?: Array<{ buckets?: Array<{ key: string }> }>
}

interface IProduct {
	nombre: string
	sku: string
	ean: string
	descripcion: string | null
}

/**
 * Busca artículos en el catálogo de Shin con la tool `article-search-aggregate`
 * de su MCP (`article-vector-search` no se usa: Shin no la mantiene). Esa
 * búsqueda encuentra la frase tal cual dentro del nombre y repite cada
 * artículo por tienda, así que se agrupa por nombre (`terms`, ordenado por
 * cantidad de tiendas) y se prueban las frases de la más específica a la más
 * general. Luego se trae el detalle de cada nombre (SKU, EAN y descripción).
 * El cliente MCP se abre la primera vez y se reutiliza; si falla se descarta
 * para reintentar.
 */

export class SearchArticlesTool {
	private readonly _MCP_TOOL_NAME = 'article-search-aggregate'
	private readonly _MAX_RESULTS = 5

	private _client: Promise<MCPClient> | null = null

	constructor(private readonly _secretsService: SecretsService) {}

	public tool(): Tool {
		return tool({
			description: `
        Busca artículos del catálogo de Supermercados Chile por nombre y devuelve hasta 5
        productos distintos. Úsala para buscar, listar o encontrar productos y productos similares,
        y para obtener el sku y EAN de un producto (necesarios para otras consultas). Es la única
        tool para buscar productos; no tiene interfaz: comenta los resultados con texto. No consulta
        planogramas.

        Input: "consultas", frases cortas de UN SOLO producto, ordenadas de la más específica a la
        más general, y la última siempre el tipo de producto (ej. ["coca cola zero", "coca cola",
        "bebida cola"]). La búsqueda encuentra la frase tal cual dentro del nombre del artículo,
        así que usa 1 a 3 palabras, sin tamaños ni formatos, artículos ni preposiciones. Para
        varios productos, haz una llamada por producto.

        Devuelve: "productos" (con "nombre", "sku", "ean" y "descripcion") encontrados con la
        primera frase que dio resultados, o un mensaje si ninguna encontró nada.
      `,
			inputSchema: z.object({
				consultas: z
					.array(z.string())
					.min(1)
					.max(5)
					.describe('Frases de búsqueda, de la más específica a la más general.'),
			}),
			execute: async ({ consultas }) => {
				try {
					const productos = await this._search(consultas)
					if (productos.length === 0) {
						return 'No se encontraron productos parecidos en el catálogo.'
					}
					return { productos }
				} catch {
					await this._resetClient()
					return 'No fue posible buscar productos en el catálogo. Intenta nuevamente más tarde.'
				}
			},
		})
	}

	public async close(): Promise<void> {
		await this._resetClient()
	}

	/**
	 * Se queda con la primera frase que encuentre algo: completar con las más
	 * generales mezcla resultados sin relación (ej. "huevos" trae huevos de
	 * chocolate y juguetes).
	 */
	private async _search(consultas: string[]): Promise<IProduct[]> {
		for (const consulta of consultas) {
			const names = await this._searchNames(consulta)
			if (names.length > 0) {
				return Promise.all(names.slice(0, this._MAX_RESULTS).map((name) => this._getProduct(name)))
			}
		}
		return []
	}

	/** El catálogo no lleva tildes ni ñ (ñoqui → NOQUI). */
	private async _searchNames(consulta: string): Promise<string[]> {
		const value = consulta.normalize('NFD').replace(DIACRITICS, '').trim()
		const { aggs } = await this._callSearch({ value, op: 'terms' }, 0)
		return (aggs?.[0]?.buckets ?? []).map((bucket) => bucket.key)
	}

	/**
	 * Cada artículo se repite por tienda y no todas las copias traen nombre y
	 * descripción, así que se toma la más completa. Algunos nombres del
	 * catálogo traen `*` al inicio.
	 */
	private async _getProduct(longName: string): Promise<IProduct> {
		const { items = [] } = await this._callSearch({ value: longName }, 10)
		const matches = items.filter((item) => item.properties?.description?.longName === longName)
		const article = matches.find((item) => item.properties?.description?.name) ?? matches[0]
		const description = article?.properties?.description
		return {
			nombre: description?.name ?? longName.replace(LEADING_ASTERISKS, '').trim(),
			sku: article?.sku ?? '',
			ean: article?.ean ?? '',
			descripcion: description?.description ?? null,
		}
	}

	private async _callSearch(filter: object, limit: number): Promise<IAggregateResult> {
		const client = await this._getClient()
		const result = await client.callTool({
			name: this._MCP_TOOL_NAME,
			arguments: {
				body: { 'description.longName': filter },
				option: { limit, contexts: ['description'] },
			},
		})
		const first = (result.content as { type: string; text?: string }[] | undefined)?.[0]
		const text = first?.type === 'text' ? (first.text ?? '') : ''
		if (result.isError) throw new Error(`Shin respondió con error: ${text}`)
		return JSON.parse(text) as IAggregateResult
	}

	private _getClient(): Promise<MCPClient> {
		this._client ??= createMCPClient({
			transport: {
				type: 'http',
				url: this._secretsService.getRequired('SHIN_PRODUCT_MCP_URL'),
				headers: {
					Authorization: `Bearer ${this._secretsService.getRequired('SHIN_PRODUCT_MCP_BEARER_TOKEN')}`,
				},
			},
			// Shin no expone el stream SSE por GET (404) y el cliente lo reporta aquí;
			// no afecta las llamadas, que se reintentan vía `execute` si fallan
			onUncaughtError: () => undefined,
		})
		return this._client
	}

	private async _resetClient(): Promise<void> {
		const client = this._client
		this._client = null
		await client?.then((c) => c.close()).catch(() => undefined)
	}
}
