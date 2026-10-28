import type { ComponentType } from 'react'
import { hydrateRoot } from 'react-dom/client'

/**
 * Envoltorio que el backend compila junto a cada componente. El navegador solo
 * importa el módulo y llama a su función por defecto: no necesita saber qué componente es.
 */
export const hydrate =
	(Component: ComponentType<any>) =>
	(el: HTMLElement, props: Record<string, unknown>, onAction: (text: string) => void) => {
		const root = hydrateRoot(el, <Component {...props} onAction={onAction} />)
		return () => queueMicrotask(() => root.unmount())
	}
