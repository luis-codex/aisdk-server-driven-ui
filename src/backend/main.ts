import { serve } from 'bun'
import index from '../frontend/index.html'
import { ChatController } from './api/chat/chat.controller'
import { RunAgent } from './api/chat/run-agent'
import { UiController } from './api/ui/ui.controller'
import { ChatAgentService } from './services/agents-service/chat-agent'
import { GetWeatherTool } from './services/agents-service/chat-agent/tools/get-weather.tool'
import { ShowEventWizardTool } from './services/agents-service/chat-agent/tools/show-event-wizard.tool'
import { ShowCartTool } from './services/agents-service/chat-agent/tools/show-cart.tool'
import { ShowInstallChartTool } from './services/agents-service/chat-agent/tools/show-install-chart.tool'
import { AzureFoundryAiService } from './services/azure-foundry-ai-service'
import { SecretsService } from './services/secrets-service'
import { UiService } from './services/ui-service'
import { WeatherService } from './services/weather-service'

// Composición de dependencias
const secretsService = new SecretsService()
const azureFoundryAiService = new AzureFoundryAiService(secretsService)
const weatherService = new WeatherService()
const uiService = new UiService()
await uiService.build()

const chatAgentService = new ChatAgentService(
	azureFoundryAiService,
	secretsService,
	new GetWeatherTool(weatherService, uiService),
	new ShowInstallChartTool(uiService),
	new ShowCartTool(uiService),
	new ShowEventWizardTool(uiService)
)
const chatController = new ChatController(new RunAgent(chatAgentService))
const uiController = new UiController(uiService)

const server = serve({
	routes: {
		'/*': index,
		'/ui/:file': (req) => uiController.find(req.params.file),
		'/api/chat': { POST: (req) => chatController.stream(req) },
	},

	development: process.env.NODE_ENV !== 'production' && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
})

console.log(`🚀 Server running at ${server.url}`)
