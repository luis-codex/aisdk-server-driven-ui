import { ToolLoopAgent, type ToolSet } from 'ai'
import { AzureFoundryAiService } from '@/backend/services/azure-foundry-ai-service'
import { SecretsService } from '@/backend/services/secrets-service'
import type { IAgentService } from '../types'
import { GetWeatherTool } from './tools/get-weather.tool'
import { ShowCartTool } from './tools/show-cart.tool'
import { ShowEventWizardTool } from './tools/show-event-wizard.tool'
import { ShowInstallChartTool } from './tools/show-install-chart.tool'

const INSTRUCTIONS = `
Eres un asistente simple y amable. Responde en español.
Usa getWeather cuando pregunten por el clima y showInstallChart para gráficas de instalaciones.
La UI ya muestra la tarjeta o gráfica: no repitas sus datos, solo comenta brevemente.

Catálogo de bebidas: Black Sugar Hoick Latte, Classic Milk Tea y Matcha Latte.
- Si preguntan qué bebidas hay, respóndelo con texto; no abras el carrito.
- Usa showCart solo cuando el usuario pida comprar o elegir bebidas. La tarjeta es interactiva:
  el usuario elige ahí y su decisión llega como un mensaje ("Confirmo la compra: …" o
  "Agrégalo al carrito: …").
- Cuando llegue ese mensaje, confírmalo en una frase y NO vuelvas a llamar showCart.

Agenda de eventos:
- Usa showEventWizard cuando el usuario quiera agendar, crear o programar un evento o reunión;
  precarga lo que ya haya dicho (título, fecha, hora, lugar).
- El formulario es interactivo: el usuario lo completa ahí y su decisión llega como un mensaje
  ("Confirmo el evento: …" o "Descarto el evento."). Cuando llegue, respóndelo en una frase y NO vuelvas a llamar showEventWizard.
Todo es una simulación.
`

export class ChatAgentService implements IAgentService {
	constructor(
		private readonly _azureFoundryAiService: AzureFoundryAiService,
		private readonly _secretsService: SecretsService,
		private readonly _getWeatherTool: GetWeatherTool,
		private readonly _showInstallChartTool: ShowInstallChartTool,
		private readonly _showCartTool: ShowCartTool,
		private readonly _showEventWizardTool: ShowEventWizardTool
	) {}

	public getAgent(): ToolLoopAgent<never, ToolSet> {
		const modelId = this._secretsService.getRequired('AZURE_OPENAI_GENERATIVE_DEPLOYMENT')
		return new ToolLoopAgent<never, ToolSet>({
			model: this._azureFoundryAiService.responsesModel(modelId),
			instructions: `${INSTRUCTIONS}\nFecha de hoy: ${new Date().toISOString().slice(0, 10)}.`,
			tools: {
				getWeather: this._getWeatherTool.tool(),
				showInstallChart: this._showInstallChartTool.tool(),
				showCart: this._showCartTool.tool(),
				showEventWizard: this._showEventWizardTool.tool(),
			},
		})
	}
}
