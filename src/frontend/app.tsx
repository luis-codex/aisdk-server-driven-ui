import { useChat } from '@ai-sdk/react'
import { isToolUIPart } from 'ai'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ServerComponent, type IServerUI } from './ui/components/server-component'
import './index.css'

const SUGGESTIONS: { text: string; icon: ReactNode }[] = [
	{
		text: '¿Qué puedes hacer?',
		icon: (
			<>
				<circle cx="12" cy="12" r="9" />
				<path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5M12 17h.01" />
			</>
		),
	},
	{
		text: '¿Qué clima hace en Santiago?',
		icon: (
			<>
				<circle cx="12" cy="12" r="4" />
				<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
			</>
		),
	},
	{
		text: 'Quiero simular una compra de bobas',
		icon: (
			<>
				<path d="M6 6h15l-1.5 9h-12zM6 6L5 3H2" />
				<circle cx="9" cy="20" r="1.2" />
				<circle cx="18" cy="20" r="1.2" />
			</>
		),
	},
	{
		text: 'Muéstrame la gráfica de instalaciones',
		icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
	},
	{
		text: 'Dime el clima en Quito',
		icon: (
			<>
				<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
				<circle cx="12" cy="10" r="2.5" />
			</>
		),
	},
]

function Icon({ children }: { children: ReactNode }) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{children}
		</svg>
	)
}

export const App: React.FC = () => {
	const [input, setInput] = useState('')
	const { messages, sendMessage, status, error } = useChat()
	const bottomRef = useRef<HTMLDivElement>(null)
	const busy = status !== 'ready'

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	const send = (text: string) => {
		if (!text.trim() || busy) return
		sendMessage({ text })
		setInput('')
	}

	return (
		<div className="w-[480px] max-w-[calc(100vw-2rem)] h-[min(92vh,780px)] flex flex-col rounded-[2rem] border border-white/10 bg-[#212121] shadow-2xl p-6 gap-4 text-left">
			<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
				{messages.length === 0 ? (
					<div className="mt-auto flex flex-col gap-5">
						<h1 className="text-3xl font-semibold">¿En qué puedo ayudarte hoy?</h1>
						<ul className="flex flex-col gap-1">
							{SUGGESTIONS.map((s) => (
								<li key={s.text}>
									<button
										className="flex items-center gap-4 w-full py-3 text-lg text-white/60 hover:text-white transition-colors cursor-pointer text-left"
										onClick={() => send(s.text)}
									>
										<Icon>{s.icon}</Icon>
										{s.text}
									</button>
								</li>
							))}
						</ul>
					</div>
				) : (
					messages.map((m) => (
						<div
							key={m.id}
							className={
								m.role === 'user'
									? 'self-end max-w-[85%] bg-[#303030] rounded-3xl px-4 py-2'
									: 'flex flex-col gap-3'
							}
						>
							{m.parts.map((part, i) => {
								if (part.type === 'text')
									return (
										<p key={i} className="whitespace-pre-wrap">
											{part.text}
										</p>
									)
								if (isToolUIPart(part)) {
									if (part.state === 'output-error')
										return (
											<p key={i} className="text-red-400">
												{part.errorText}
											</p>
										)
									if (part.state !== 'output-available')
										return (
											<p key={i} className="text-sm text-white/50">
												Preparando...
											</p>
										)
									// Un tool puede responder con un texto (p. ej. "no se encontró la ciudad") en vez de un componente.
									if (typeof part.output === 'string')
										return (
											<p key={i} className="text-sm text-white/50">
												{part.output}
											</p>
										)
									return <ServerComponent key={i} {...(part.output as IServerUI)} onAction={send} />
								}
								return null
							})}
						</div>
					))
				)}
				{error && <p className="text-red-400">{error.message}</p>}
				<div ref={bottomRef} />
			</div>

			<form
				className="flex items-center gap-3 rounded-full bg-[#303030] pl-6 pr-2 py-2"
				onSubmit={(e) => {
					e.preventDefault()
					send(input)
				}}
			>
				<input
					className="flex-1 bg-transparent outline-none text-lg placeholder:text-white/40"
					value={input}
					onChange={(e) => setInput(e.currentTarget.value)}
					placeholder="Enviar mensaje a la IA"
				/>
				<button
					className="size-11 rounded-full bg-white text-black grid place-items-center disabled:opacity-40 cursor-pointer"
					disabled={busy || !input.trim()}
					aria-label="Enviar"
				>
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M12 19V5M5 12l7-7 7 7" />
					</svg>
				</button>
			</form>
		</div>
	)
}

export default App
