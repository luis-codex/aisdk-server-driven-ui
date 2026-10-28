import { tool, type Tool } from 'ai'
import { z } from 'zod'
import type { InstallDay } from '@/backend/components/install-chart'
import { UiService } from '@/backend/services/ui-service'

const DAY_MS = 864e5

// Datos simulados (demo): instalaciones por plataforma de los últimos 7 días.
const DESKTOP = [445, 365, 245, 90, 138, 225, 138]
const ANDROID = [85, 45, 62, 60, 62, 52, 90]
const IOS = [360, 415, 182, 152, 200, 172, 235]

export class ShowInstallChartTool {
	constructor(private readonly _uiService: UiService) {}

	public tool(): Tool {
		return tool({
			description: `
        Muestra una gráfica de instalaciones por plataforma (escritorio, Android, iOS) de los últimos 7 días.

        Úsala cuando el usuario pida ver las instalaciones o su mix por plataforma.
      `,
			inputSchema: z.object({}),
			execute: async () => this._uiService.render('InstallChart', { days: this._buildDays() }),
			toModelOutput: ({ output }) => ({ type: 'text', value: JSON.stringify(output.props) }),
		})
	}

	private _buildDays(): InstallDay[] {
		return DESKTOP.map((desktop, i) => ({
			label: new Date(Date.now() - (6 - i) * DAY_MS).toLocaleDateString('es-CL', {
				day: 'numeric',
				month: 'short',
			}),
			desktop,
			android: ANDROID[i]!,
			ios: IOS[i]!,
		}))
	}
}
