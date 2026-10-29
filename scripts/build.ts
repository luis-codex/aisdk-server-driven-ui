#!/usr/bin/env bun
import tailwind from 'bun-plugin-tailwind'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { buildUiModules } from '../src/backend/services/ui-service/build-ui-modules'

const projectDir = path.resolve(import.meta.dir, '..')
const publicDir = path.join(projectDir, 'public')
const uiDir = path.join(publicDir, 'ui')

process.env.NODE_ENV = 'production'
await rm(publicDir, { recursive: true, force: true })

const frontendResult = await Bun.build({
	entrypoints: [path.join(projectDir, 'src/frontend/index.html')],
	outdir: publicDir,
	plugins: [tailwind],
	target: 'browser',
	minify: true,
	define: { 'process.env.NODE_ENV': JSON.stringify('production') },
})
if (!frontendResult.success) {
	throw new AggregateError(frontendResult.logs, 'Falló la compilación del frontend')
}

const uiModules = await buildUiModules()
await mkdir(uiDir, { recursive: true })
await Promise.all(
	uiModules.map(({ fileName, contents }) => Bun.write(path.join(uiDir, fileName), contents))
)

console.log(`Frontend compilado en ${publicDir}`)
console.log(`Módulos de componentes compilados: ${uiModules.length}`)
