import path from 'node:path'
import { serve } from 'bun'
import { createApp } from './backend/app'

const { routes } = createApp()
// Frontend y módulos de componentes compilados por `bun run build`.
const PUBLIC_DIR = path.resolve(import.meta.dir, '../public')

const serveStatic = async (req: Request): Promise<Response> => {
	const { pathname } = new URL(req.url)
	const file = Bun.file(path.join(PUBLIC_DIR, path.normalize(pathname)))
	if (pathname !== '/' && (await file.exists())) return new Response(file)
	return new Response(Bun.file(path.join(PUBLIC_DIR, 'index.html')))
}

const server = serve({
	// El agente puede pasar más de 10 s (el default) sin enviar bytes mientras piensa o llama tools.
	idleTimeout: 255,
	routes,
	fetch: serveStatic,
	...(process.env.PORT ? { port: Number(process.env.PORT) } : {}),
})

console.log(`🚀 Server running at ${server.url}`)
