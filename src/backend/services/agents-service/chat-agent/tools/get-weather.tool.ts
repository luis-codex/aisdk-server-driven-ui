import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { UiService } from '@/backend/services/ui-service'
import { WeatherService } from '@/backend/services/weather-service'

export class GetWeatherTool {
	constructor(
		private readonly _weatherService: WeatherService,
		private readonly _uiService: UiService
	) {}

	public tool(): Tool {
		return tool({
			description: `
        Obtiene el clima actual de una ciudad.

        Input: "city" (nombre de la ciudad, ej. Santiago).

        Devuelve una tarjeta con temperatura, sensación térmica, humedad y viento.

        Úsala cuando el usuario pregunte por el clima de un lugar.
      `,
			inputSchema: z.object({
				city: z.string().describe('Nombre de la ciudad, ej. Santiago'),
			}),
			execute: async ({ city }) => {
				try {
					const weather = await this._weatherService.getCurrent(city)
					if (!weather) return this._handleNotFoundError(city)
					return this._uiService.render('WeatherCard', weather)
				} catch (error) {
					// Sin esto el AI SDK oculta la excepción como "An error occurred." y no queda registro
					console.error(`[GetWeatherTool] Error consultando el clima de ${city}: ${error}`)
					return this._handleGenericError()
				}
			},
			// El modelo recibe los props (datos), nunca el HTML.
			toModelOutput: ({ output }) => ({
				type: 'text',
				value: typeof output === 'string' ? output : JSON.stringify(output.props),
			}),
		})
	}

	private _handleNotFoundError(city: string) {
		return `No se encontró la ciudad "${city}".`
	}

	private _handleGenericError() {
		return 'No fue posible obtener el clima.'
	}
}
