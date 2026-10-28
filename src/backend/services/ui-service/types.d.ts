/** Contrato con el frontend: dónde está el código, con qué props y qué HTML pintar mientras tanto. */
export interface IServerUI {
	module: string
	props: Record<string, unknown>
	html: string
}
