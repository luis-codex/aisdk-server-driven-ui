import { ChatController } from './api/chat/chat.controller'
import { RunAgent } from './api/chat/run-agent'
import { ChatAgentService } from './services/agents-service/chat-agent'
import { GetPlanogramsTool } from './services/agents-service/chat-agent/tools/get-planograms.tool'
import { GetWeatherTool } from './services/agents-service/chat-agent/tools/get-weather.tool'
import { ManageProductTasksTool } from './services/agents-service/chat-agent/tools/manage-product-tasks.tool'
import { SearchArticlesTool } from './services/agents-service/chat-agent/tools/search-articles.tool'
import { ShowCartTool } from './services/agents-service/chat-agent/tools/show-cart.tool'
import { ShowEventWizardTool } from './services/agents-service/chat-agent/tools/show-event-wizard.tool'
import { ShowInstallChartTool } from './services/agents-service/chat-agent/tools/show-install-chart.tool'
import { ApiKeyAuthService } from './services/api-key-auth-service'
import { AzureFoundryAiService } from './services/azure-foundry-ai-service'
import { PlanogramsService } from './services/planograms-service'
import { ProductTasksService } from './services/product-tasks-service'
import { SecretsService } from './services/secrets-service'
import { UiService } from './services/ui-service'
import { WeatherService } from './services/weather-service'

type AppOptions = {
	uiModules?: ReadonlyMap<string, Blob>
}

/** Composición compartida por el servidor de API de Vercel y el servidor local de desarrollo. */
export function createApp({ uiModules = new Map() }: AppOptions = {}) {
	const secretsService = new SecretsService()
	const azureFoundryAiService = new AzureFoundryAiService(secretsService)
	const weatherService = new WeatherService()
	const productTasksService = new ProductTasksService()
	const uiService = new UiService(uiModules)

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
	const apiKeyAuthService = new ApiKeyAuthService()

	process.on('SIGTERM', () => void searchArticlesTool.close())

	const getSession = (request: Request) =>
		apiKeyAuthService.authorize(request) ?? new Response(null, { status: 204 })
	const postChat = (request: Request) =>
		apiKeyAuthService.authorize(request) ?? chatController.stream(request)
	const routes = {
		'/api/session': {
			GET: getSession,
		},
		'/api/chat': {
			POST: postChat,
		},
	}

	return { routes, uiService }
}
