import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import type { ComponentProps, ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { COMPONENTS, type ComponentName } from '@/backend/components'
import type { IServerUI } from './types'

const MODULES_PATH = '/ui'
const COMPONENTS_DIR = path.resolve(import.meta.dir, '../../components')
// Dentro de node_modules para que los imports de "react" se resuelvan desde el proyecto.
const ENTRIES_DIR = path.resolve(import.meta.dir, '../../../../node_modules/.cache/ui-entries')

/**
 * Renderiza los componentes en el servidor y los compila como módulos ESM para que el
 * navegador los hidrate. El frontend solo recibe la URL del módulo: no conoce los componentes.
 */
export class UiService {
	private _modules = new Map<string, Blob>()

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

	/** Compila cada componente con `splitting` para compartir React en un chunk común. */
	public async build(): Promise<void> {
		const entrypoints = await this._writeEntries()
		const result = await Bun.build({
			entrypoints,
			target: 'browser',
			format: 'esm',
			splitting: true,
			minify: process.env.NODE_ENV === 'production',
			naming: { entry: '[name].[ext]', chunk: 'chunk-[hash].[ext]' },
			define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development') },
		})
		if (!result.success)
			throw new AggregateError(result.logs, 'Falló la compilación de componentes')
		this._modules = new Map(result.outputs.map((output) => [path.basename(output.path), output]))
	}

	public findModule(file: string): Blob | undefined {
		return this._modules.get(file)
	}

	private async _writeEntries(): Promise<string[]> {
		await mkdir(ENTRIES_DIR, { recursive: true })
		return Promise.all(
			Object.keys(COMPONENTS).map(async (name) => {
				const file = path.join(ENTRIES_DIR, `${name}.tsx`)
				const dir = path.join(COMPONENTS_DIR, this._toKebabCase(name))
				await Bun.write(
					file,
					`import { ${name} } from ${JSON.stringify(dir)}\n` +
						`import { hydrate } from ${JSON.stringify(path.join(COMPONENTS_DIR, 'hydrate'))}\n` +
						`export default hydrate(${name})\n`
				)
				return file
			})
		)
	}

	private _toKebabCase(name: string): string {
		return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
	}
}
