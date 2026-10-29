import { serve } from 'bun'
import index from './frontend/index.html'
import { createApp } from './backend/app'
import { buildUiModules } from './backend/services/ui-service/build-ui-modules'
import { UiController } from './backend/api/ui/ui.controller'

const uiModules = new Map(
	(await buildUiModules()).map(({ fileName, contents }) => [fileName, contents])
)
const { routes, uiService } = createApp({ uiModules })
const uiController = new UiController(uiService)

const server = serve({
	idleTimeout: 255,
	routes: {
		...routes,
		'/ui/:file': (request) => uiController.find(request.params.file),
		'/*': index,
	},
	...(process.env.PORT ? { port: Number(process.env.PORT) } : {}),
	development: process.env.NODE_ENV !== 'production' && {
		hmr: true,
		console: true,
	},
})

console.log(`🚀 Dev server running at ${server.url}`)
