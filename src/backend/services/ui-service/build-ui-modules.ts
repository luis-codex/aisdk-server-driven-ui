import path from 'node:path'
import { COMPONENTS } from '@/backend/components'

const COMPONENTS_DIR = path.resolve(import.meta.dir, '../../components')
const ENTRY_NAMESPACE = 'ui-component-entry'

export type UiModuleArtifact = {
	fileName: string
	contents: Blob
}

/** Compila una entrada virtual por componente y un chunk compartido para React y hydrate. */
export async function buildUiModules(): Promise<UiModuleArtifact[]> {
	const result = await Bun.build({
		entrypoints: Object.keys(COMPONENTS),
		plugins: [
			{
				name: 'virtual-ui-component-entries',
				setup: (build) => {
					build.onResolve({ filter: /.*/ }, (args) =>
						args.kind === 'entry-point-build' || args.kind === 'entry-point-run'
							? { path: args.path, namespace: ENTRY_NAMESPACE }
							: undefined
					)
					build.onLoad({ filter: /.*/, namespace: ENTRY_NAMESPACE }, (args) => ({
						contents:
							`import { ${args.path} } from ${JSON.stringify(path.join(COMPONENTS_DIR, _toKebabCase(args.path)))}\n` +
							`import { hydrate } from ${JSON.stringify(path.join(COMPONENTS_DIR, 'hydrate'))}\n` +
							`export default hydrate(${args.path})\n`,
						loader: 'tsx',
						resolveDir: COMPONENTS_DIR,
					}))
				},
			},
		],
		target: 'browser',
		format: 'esm',
		splitting: true,
		minify: process.env.NODE_ENV === 'production',
		naming: { entry: '[name].[ext]', chunk: 'chunk-[hash].[ext]' },
		define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development') },
	})
	if (!result.success) throw new AggregateError(result.logs, 'Falló la compilación de componentes')
	return result.outputs.map((output) => ({
		fileName: path.basename(output.path),
		contents: output,
	}))
}

function _toKebabCase(name: string): string {
	return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}
