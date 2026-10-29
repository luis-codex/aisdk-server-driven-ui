import { CartCard } from './cart-card'
import { EventWizard } from './event-wizard'
import { InstallChart } from './install-chart'
import { PlanogramList } from './planogram-list'
import { ProductTaskManager } from './product-task-manager'
import { WeatherCard } from './weather-card'

// Componentes que el backend puede mostrar. Cada uno se sirve también como módulo para el navegador.
export const COMPONENTS = {
	WeatherCard,
	InstallChart,
	CartCard,
	EventWizard,
	PlanogramList,
	ProductTaskManager,
}

export type ComponentName = keyof typeof COMPONENTS
