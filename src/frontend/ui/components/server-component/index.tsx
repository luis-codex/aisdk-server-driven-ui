import { useEffect, useRef } from 'react'

/** Contrato con el backend: dónde está el código, con qué props y qué HTML pintar mientras tanto. */
export interface IServerUI {
	module: string
	props: Record<string, unknown>
	html: string
}

type Hydrate = (
	el: HTMLElement,
	props: Record<string, unknown>,
	onAction: (text: string) => void
) => () => void

type ServerComponentProps = IServerUI & { onAction: (text: string) => void }

/**
 * Pinta el HTML que mandó el backend y, cuando baja el módulo que él mismo sirve,
 * lo hidrata. No sabe qué componente es: solo importa la URL que recibe.
 */
export const ServerComponent: React.FC<ServerComponentProps> = ({
	module,
	props,
	html,
	onAction,
}) => {
	const ref = useRef<HTMLDivElement>(null)
	const action = useRef(onAction)
	action.current = onAction

	useEffect(() => {
		let cancelled = false
		let dispose: (() => void) | undefined
		import(/* @vite-ignore */ module).then(({ default: hydrate }: { default: Hydrate }) => {
			if (!cancelled) dispose = hydrate(ref.current!, props, (text) => action.current(text))
		})
		return () => {
			cancelled = true
			dispose?.()
		}
		// Se hidrata una sola vez por html; props llega siempre junto con el html.
	}, [html])

	return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
}
