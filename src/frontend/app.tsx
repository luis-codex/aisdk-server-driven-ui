// biome-ignore-all lint/suspicious/noArrayIndexKey: message parts are rendered in stable stream order
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isToolUIPart } from 'ai'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAttachments } from './shared/hooks/use-attachments'
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
		text: 'Quiero gestionar mis tareas pendientes',
		icon: (
			<>
				<rect x="4" y="4" width="16" height="17" rx="2" />
				<path d="M8 2v4M16 2v4M8 11h8M8 15h5" />
			</>
		),
	},
	{
		text: 'Busca macetas en el catálogo',
		icon: (
			<>
				<circle cx="10.5" cy="10.5" r="6.5" />
				<path d="m16 16 5 5M7 9h7M7 12h5" />
			</>
		),
	},
	{
		text: 'Muéstrame el planograma de un producto',
		icon: (
			<>
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<path d="M3 9h18M9 9v12M15 9v12" />
			</>
		),
	},
	{
		text: 'Quiero agendar una reunión',
		icon: (
			<>
				<rect x="3" y="4" width="18" height="18" rx="2" />
				<path d="M8 2v4M16 2v4M3 10h18" />
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
			aria-hidden="true"
		>
			{children}
		</svg>
	)
}

export const App: React.FC = () => {
	const [input, setInput] = useState('')
	const [apiKey, setApiKey] = useState(() => localStorage.getItem('api-key') ?? '')
	const [keyInput, setKeyInput] = useState('')
	const [showApiKey, setShowApiKey] = useState(false)
	const [authError, setAuthError] = useState('')
	const [isVerifying, setIsVerifying] = useState(false)
	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				headers: () => ({ Authorization: `Bearer ${localStorage.getItem('api-key') ?? ''}` }),
				fetch: (async (input, init) => {
					const response = await fetch(input, init)
					if (response.status === 401) {
						localStorage.removeItem('api-key')
						setApiKey('')
						setAuthError('API key inválida')
					}
					return response
				}) as typeof fetch,
			}),
		[]
	)
	const { messages, sendMessage, setMessages, stop, status, error } = useChat({ transport })
	const attachments = useAttachments()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const bottomRef = useRef<HTMLDivElement>(null)
	const busy = status !== 'ready'

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll after each message update
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	// Una acción de un componente puede llegar mientras el agente aún escribe: se envía al terminar.
	const [pendingAction, setPendingAction] = useState<string>()

	useEffect(() => {
		if (pendingAction && status === 'ready') {
			sendMessage({ text: pendingAction })
			setPendingAction(undefined)
		}
	}, [pendingAction, status, sendMessage])

	const send = (text: string) => {
		if (!text.trim() || busy) return
		sendMessage({ text })
		setInput('')
	}

	const sendAction = (text: string) => {
		if (busy) setPendingAction(text)
		else sendMessage({ text })
	}

	const submit = async () => {
		if ((!input.trim() && attachments.attachments.length === 0) || busy) return
		const files = await attachments.toFileParts()
		sendMessage({ text: input, files })
		setInput('')
		attachments.clear()
	}

	const newChat = () => {
		stop()
		setMessages([])
		setInput('')
		attachments.clear()
	}

	return (
		<div className="flex flex-col items-center gap-3">
			<div className="w-[480px] max-w-[calc(100vw-2rem)] h-[min(88vh,780px)] flex flex-col rounded-[2rem] border border-neutral-200 bg-white text-neutral-900 shadow-2xl p-6 gap-4 text-left">
				{apiKey && (
					<div className="flex justify-end -mb-2 gap-1">
						<button
							type="button"
							className="px-3 text-sm text-neutral-500 hover:text-neutral-900"
							onClick={() => {
								localStorage.removeItem('api-key')
								setApiKey('')
								setMessages([])
							}}
						>
							Salir
						</button>
						<button
							type="button"
							className="size-10 rounded-xl grid place-items-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer"
							onClick={newChat}
							aria-label="Chat nuevo"
							title="Chat nuevo"
						>
							<Icon>
								<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
								<path d="M18.4 2.6a1 1 0 0 1 3 3l-9 9a2 2 0 0 1-.9.5l-2.9.8a.5.5 0 0 1-.6-.6l.8-2.9a2 2 0 0 1 .5-.9z" />
							</Icon>
						</button>
					</div>
				)}

				{!apiKey ? (
					<form
						className="mx-auto flex w-full max-w-80 flex-1 flex-col items-center justify-center gap-4 text-center"
						onSubmit={async (event) => {
							event.preventDefault()
							if (!keyInput.trim() || isVerifying) return
							setIsVerifying(true)
							setAuthError('')
							try {
								const response = await fetch('/api/session', {
									headers: { Authorization: `Bearer ${keyInput}` },
								})
								if (response.status === 204) {
									localStorage.setItem('api-key', keyInput)
									setApiKey(keyInput)
									setKeyInput('')
								} else if (response.status === 401) {
									setAuthError('API key inválida')
								} else {
									setAuthError('No se pudo conectar')
								}
							} catch {
								setAuthError('No se pudo conectar')
							} finally {
								setIsVerifying(false)
							}
						}}
					>
						<div className="grid size-14 place-items-center rounded-full bg-neutral-100 text-neutral-700">
							<svg
								width="26"
								height="26"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.6"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<rect x="4" y="10" width="16" height="11" rx="2" />
								<path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" />
							</svg>
						</div>
						<div className="flex flex-col gap-1">
							<h1 className="text-2xl font-semibold">Bienvenido</h1>
							<p className="text-sm text-neutral-500">
								Ingresa tu API key para usar el asistente de tareas.
							</p>
						</div>
						<div className="flex h-12 w-full items-center rounded-full bg-neutral-100 px-4 transition-shadow focus-within:ring-2 focus-within:ring-neutral-300">
							<input
								type={showApiKey ? 'text' : 'password'}
								aria-label="API key"
								placeholder="API key"
								className="min-w-0 flex-1 bg-transparent text-center text-sm outline-none placeholder:text-neutral-400"
								value={keyInput}
								onChange={(event) => {
									setKeyInput(event.currentTarget.value)
									setAuthError('')
								}}
							/>
							<button
								type="button"
								className="grid size-8 shrink-0 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-800"
								onClick={() => setShowApiKey((visible) => !visible)}
								aria-label={showApiKey ? 'Ocultar API key' : 'Mostrar API key'}
								title={showApiKey ? 'Ocultar API key' : 'Mostrar API key'}
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.7"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									{showApiKey ? (
										<>
											<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
											<path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a14 14 0 0 1-2.1 2.8M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7a10 10 0 0 0 3.1-.5" />
										</>
									) : (
										<>
											<path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
											<circle cx="12" cy="12" r="2.5" />
										</>
									)}
								</svg>
							</button>
						</div>
						{authError && (
							<p
								className="animate-[pulse_500ms_ease-out_1] text-sm text-red-500"
								aria-live="polite"
							>
								{authError}
							</p>
						)}
						<button
							type="submit"
							className="h-12 w-full rounded-full bg-neutral-900 px-5 font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900"
							disabled={!keyInput.trim() || isVerifying}
						>
							{isVerifying ? 'Verificando…' : 'Entrar'}
						</button>
						<p className="text-xs text-neutral-400">La key se guarda solo en este navegador.</p>
					</form>
				) : (
					<>
						<div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
							{messages.length === 0 ? (
								<div className="mt-auto flex flex-col gap-5">
									<h1 className="text-3xl font-semibold">¿En qué puedo ayudarte hoy?</h1>
									<ul className="flex flex-col gap-1">
										{SUGGESTIONS.map((s) => (
											<li key={s.text}>
												<button
													type="button"
													className="flex items-center gap-4 w-full py-3 text-lg text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer text-left"
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
												? 'self-end max-w-[85%] flex flex-col items-end gap-2'
												: 'flex flex-col gap-3'
										}
									>
										{m.parts.map((part, i) => {
											if (part.type === 'text')
												return (
													<p
														key={i}
														className={`whitespace-pre-wrap ${m.role === 'user' ? 'bg-neutral-100 rounded-3xl px-4 py-2' : ''}`}
													>
														{part.text}
													</p>
												)
											if (part.type === 'file' && part.mediaType.startsWith('image/'))
												return (
													<img
														key={i}
														src={part.url}
														alt={part.filename ?? 'Imagen adjunta'}
														className="max-h-48 rounded-2xl object-cover"
													/>
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
														<p key={i} className="text-sm text-neutral-500">
															Preparando...
														</p>
													)
												// Un tool puede responder con un texto (p. ej. "no se encontró la ciudad") en vez de un componente.
												if (typeof part.output === 'string')
													return (
														<p key={i} className="text-sm text-neutral-500">
															{part.output}
														</p>
													)
												// Los tools de datos (p. ej. searchArticles) no devuelven un componente: no hay nada que pintar.
												if (!(part.output as Partial<IServerUI> | undefined)?.module) return null
												return (
													<ServerComponent
														key={i}
														{...(part.output as IServerUI)}
														onAction={sendAction}
													/>
												)
											}
											return null
										})}
									</div>
								))
							)}
							{error && <p className="text-red-400">{error.message}</p>}
							<div ref={bottomRef} />
						</div>

						{attachments.attachments.length > 0 && (
							<div className="flex gap-2 px-2">
								{attachments.attachments.map((a) => (
									<div key={a.id} className="relative">
										<img
											src={a.previewUrl}
											alt={a.file.name}
											className="size-16 rounded-xl object-cover"
										/>
										<button
											type="button"
											className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-neutral-900 text-white text-xs leading-none cursor-pointer"
											onClick={() => attachments.remove(a.id)}
											aria-label={`Quitar ${a.file.name}`}
										>
											×
										</button>
									</div>
								))}
							</div>
						)}

						<form
							className="flex items-center gap-2 rounded-full bg-neutral-100 border border-neutral-200 pl-2 pr-2 py-2"
							onSubmit={(e) => {
								e.preventDefault()
								submit()
							}}
						>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								multiple
								hidden
								onChange={(e) => {
									attachments.add(e.currentTarget.files)
									e.currentTarget.value = ''
								}}
							/>
							<button
								type="button"
								className="size-11 shrink-0 rounded-full grid place-items-center text-neutral-500 hover:text-neutral-900 disabled:opacity-40 cursor-pointer"
								disabled={!attachments.canAdd}
								onClick={() => fileInputRef.current?.click()}
								aria-label="Adjuntar imagen"
								title="Adjuntar imagen"
							>
								<Icon>
									<path d="M12 5v14M5 12h14" />
								</Icon>
							</button>
							<input
								className="flex-1 min-w-0 bg-transparent outline-none text-lg placeholder:text-neutral-400"
								value={input}
								onChange={(e) => setInput(e.currentTarget.value)}
								placeholder="Enviar mensaje a la IA"
							/>
							<button
								type="submit"
								className="size-11 shrink-0 rounded-full bg-neutral-900 text-white grid place-items-center disabled:opacity-40 cursor-pointer"
								disabled={busy || (!input.trim() && attachments.attachments.length === 0)}
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
									aria-hidden="true"
								>
									<path d="M12 19V5M5 12l7-7 7 7" />
								</svg>
							</button>
						</form>
					</>
				)}
			</div>
			<p className="max-w-[440px] text-center text-xs text-neutral-400">
				Las tarjetas son componentes de servidor: el backend las renderiza y administra, y el
				navegador solo las hidrata para hacerlas interactivas.
			</p>
		</div>
	)
}

export default App
