import { serve } from 'bun'
import index from './frontend/index.html'
import { ChatController } from './backend/api/chat/chat.controller'
import { RunAgent } from './backend/api/chat/run-agent'
import { UiController } from './backend/api/ui/ui.controller'
import { ChatAgentService } from './backend/services/agents-service/chat-agent'
import { GetPlanogramsTool } from './backend/services/agents-service/chat-agent/tools/get-planograms.tool'
import { GetWeatherTool } from './backend/services/agents-service/chat-agent/tools/get-weather.tool'
import { ManageProductTasksTool } from './backend/services/agents-service/chat-agent/tools/manage-product-tasks.tool'
import { SearchArticlesTool } from './backend/services/agents-service/chat-agent/tools/search-articles.tool'
import { ShowEventWizardTool } from './backend/services/agents-service/chat-agent/tools/show-event-wizard.tool'
import { ShowCartTool } from './backend/services/agents-service/chat-agent/tools/show-cart.tool'
import { ShowInstallChartTool } from './backend/services/agents-service/chat-agent/tools/show-install-chart.tool'
import { ApiKeyAuthService } from './backend/services/api-key-auth-service'
import { AzureFoundryAiService } from './backend/services/azure-foundry-ai-service'
import { PlanogramsService } from './backend/services/planograms-service'
import { ProductTasksService } from './backend/services/product-tasks-service'
import { SecretsService } from './backend/services/secrets-service'
import { UiService } from './backend/services/ui-service'
import { WeatherService } from './backend/services/weather-service'

// Composición de dependencias
const secretsService = new SecretsService()
const azureFoundryAiService = new AzureFoundryAiService(secretsService)
const weatherService = new WeatherService()
const productTasksService = new ProductTasksService()
const uiService = new UiService()
await uiService.build()

const searchArticlesTool = new SearchArticlesTool(secretsService)
const chatAgentService = new ChatAgentService(
	azureFoundryAiService,
	secretsService,
	new GetWeatherTool(weatherService, uiService),
	new ShowInstallChartTool(uiService),
	new ShowCartTool(uiService),
	new ShowEventWizardTool(uiService),
	searchArticlesTool,
	new GetPlanogramsTool(new PlanogramsService(secretsService), uiService),
	new ManageProductTasksTool(productTasksService, uiService)
)
const chatController = new ChatController(new RunAgent(chatAgentService))
const uiController = new UiController(uiService)
const apiKeyAuthService = new ApiKeyAuthService()

// Cierra el cliente MCP de Shin al apagar
process.on('SIGTERM', () => void searchArticlesTool.close())

const server = serve({
	// El agente puede pasar más de 10 s (el default) sin enviar bytes mientras piensa o llama tools.
	idleTimeout: 255,
	routes: {
		'/*': index,
		'/ui/:file': (req) => uiController.find(req.params.file),
		'/api/session': {
			GET: (req) => apiKeyAuthService.authorize(req) ?? new Response(null, { status: 204 }),
		},
		'/api/chat': {
			POST: (req) => apiKeyAuthService.authorize(req) ?? chatController.stream(req),
		},
	},
	...(process.env.PORT ? { port: Number(process.env.PORT) } : {}),

	development: process.env.NODE_ENV !== 'production' && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
})

console.log(`🚀 Server running at ${server.url}`)
