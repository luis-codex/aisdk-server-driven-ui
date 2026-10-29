import type { ComponentProps, ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { COMPONENTS, type ComponentName } from '@/backend/components'
import type { IServerUI } from './types'

const MODULES_PATH = '/ui'

/**
 * Renderiza los componentes en el servidor y los compila como módulos ESM para que el
 * navegador los hidrate. El frontend solo recibe la URL del módulo: no conoce los componentes.
 */
export class UiService {
	private _modules: Map<string, Blob>

	constructor(modules: ReadonlyMap<string, Blob> = new Map()) {
		this._modules = new Map(modules)
	}

	public render<N extends ComponentName>(
		component: N,
		props: Omit<ComponentProps<(typeof COMPONENTS)[N]>, 'onAction'>
	): IServerUI {
		const Component = COMPONENTS[component] as ComponentType<Record<string, unknown>>
		// renderToString (no Static) deja el HTML listo para que el cliente lo hidrate.
		return {
			module: `${MODULES_PATH}/${component}.js`,
			props,
			html: renderToString(<Component {...props} />),
		}
	}

	public findModule(file: string): Blob | undefined {
		return this._modules.get(file)
	}
}
