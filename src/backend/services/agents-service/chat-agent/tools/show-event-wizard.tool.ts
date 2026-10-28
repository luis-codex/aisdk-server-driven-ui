import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { UiService } from '@/backend/services/ui-service'

export class ShowEventWizardTool {
	constructor(private readonly _uiService: UiService) {}

	public tool(): Tool {
		return tool({
			description: `
        Muestra un formulario por pasos (qué, cuándo, dónde y resumen) para que el usuario agende un evento.

        Input opcional, para precargar lo que el usuario ya dijo: "title", "date" (YYYY-MM-DD),
        "time" (HH:mm) y "location".

        Úsala cuando el usuario quiera agendar, crear o programar un evento, reunión o recordatorio.
        Todo es una simulación: no se guarda en ningún calendario.
      `,
			inputSchema: z.object({
				title: z.string().optional().describe('Título del evento, si el usuario lo mencionó'),
				date: z.string().optional().describe('Fecha en formato YYYY-MM-DD'),
				time: z.string().optional().describe('Hora en formato HH:mm'),
				location: z.string().optional().describe('Lugar del evento'),
			}),
			execute: async (props) => this._uiService.render('EventWizard', props),
			// El formulario es interactivo: el modelo debe saber que está abierto y esperando al usuario.
			toModelOutput: () => ({
				type: 'text',
				value:
					'Formulario de agenda mostrado al usuario. Espera que lo complete: su decisión llegará como un mensaje del usuario.',
			}),
		})
	}
}
