import { useState } from 'react'

type EventWizardProps = {
	title?: string
	date?: string
	time?: string
	location?: string
	onAction?: (text: string) => void
}

const STEPS = ['Qué', 'Cuándo', 'Dónde', 'Resumen']
const KINDS = ['Reunión', 'Cita', 'Cumpleaños', 'Recordatorio']
const DURATIONS = [30, 60, 90, 120]

// Eventos de ejemplo (simulados) para dar contexto al día en el resumen.
const SAMPLE_EVENTS = [
	{ title: 'Almuerzo', start: '12:00', end: '12:45' },
	{ title: 'Standup del equipo', start: '15:30', end: '16:00' },
]

const FIELD =
	'w-full rounded-xl bg-neutral-100 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-400'
const CARD = 'rounded-3xl bg-white text-neutral-900 border border-neutral-200'

const toMinutes = (hhmm: string) => {
	const [hours, minutes] = hhmm.split(':').map(Number)
	return hours! * 60 + minutes!
}

const toHHmm = (minutes: number) =>
	`${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export const EventWizard: React.FC<EventWizardProps> = ({
	title,
	date,
	time,
	location,
	onAction,
}) => {
	const [step, setStep] = useState(0)
	const [status, setStatus] = useState<'editing' | 'added' | 'discarded'>('editing')
	const [kind, setKind] = useState(KINDS[0]!)
	const [name, setName] = useState(title ?? '')
	const [day, setDay] = useState(date ?? '')
	const [hour, setHour] = useState(time ?? '10:00')
	const [duration, setDuration] = useState(60)
	const [place, setPlace] = useState(location ?? '')
	const [guests, setGuests] = useState('')

	const isSummary = step === STEPS.length - 1
	const canContinue =
		step === 0 ? name.trim() !== '' : step === 1 ? day !== '' && hour !== '' : true
	const end = toHHmm(toMinutes(hour) + duration)
	const details = [kind, place.trim(), guests.trim()].filter(Boolean).join(' · ')

	const add = () => {
		setStatus('added')
		const parts = [
			`${kind} "${name.trim()}"`,
			`${new Date(`${day}T00:00:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })} de ${hour} a ${end}`,
			place.trim() && `en ${place.trim()}`,
			guests.trim() && `con ${guests.trim()}`,
		]
		onAction?.(`Confirmo el evento: ${parts.filter(Boolean).join(', ')}.`)
	}

	const discard = () => {
		setStatus('discarded')
		onAction?.('Descarto el evento.')
	}

	if (status === 'discarded') {
		return <div className={`${CARD} p-4 text-center text-neutral-500`}>🗑️ Evento descartado</div>
	}

	const events = [
		...SAMPLE_EVENTS.map((event) => ({ ...event, mine: false })),
		{ title: name.trim(), start: hour, end, mine: true },
	].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
	const when = day ? new Date(`${day}T00:00:00`) : null

	return (
		<div className="flex flex-col gap-3">
			{isSummary || status === 'added' ? (
				<div className={`${CARD} p-5 flex gap-5`}>
					<div className="w-20 shrink-0">
						<p className="text-neutral-500 capitalize">
							{when?.toLocaleDateString('es-CL', { weekday: 'long' })}
						</p>
						<p className="text-6xl font-light leading-tight">{when?.getDate()}</p>
						<p className="text-sm text-neutral-500 capitalize">
							{when?.toLocaleDateString('es-CL', { month: 'long' })}
						</p>
					</div>
					<div className="flex-1 min-w-0 flex flex-col gap-3">
						{events.map((event) => (
							<div
								key={`${event.title}-${event.start}`}
								className={`flex gap-3 rounded-2xl p-3 ${
									event.mine
										? `border-2 ${status === 'added' ? 'border-solid' : 'border-dashed'} border-blue-500`
										: 'bg-neutral-100'
								}`}
							>
								<div
									className={`w-1 shrink-0 rounded-full ${event.mine ? 'bg-blue-500' : 'bg-red-500'}`}
								/>
								<div className="min-w-0">
									<p className="text-lg leading-snug truncate">{event.title}</p>
									<p className="text-neutral-500">
										{event.start} - {event.end}
									</p>
									{event.mine && details && (
										<p className="text-sm text-neutral-500 truncate">{details}</p>
									)}
								</div>
							</div>
						))}
						<p className="text-xs text-neutral-400">Los demás eventos son de ejemplo (simulado).</p>
					</div>
				</div>
			) : (
				<div className={`${CARD} p-4 flex flex-col gap-3`}>
					<div className="flex gap-1.5">
						{STEPS.map((label, i) => (
							<div
								key={label}
								className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-neutral-900' : 'bg-neutral-200'}`}
							/>
						))}
					</div>
					<p className="text-sm text-neutral-500">
						Paso {step + 1} de {STEPS.length} · {STEPS[step]}
					</p>

					{step === 0 && (
						<>
							<label className="flex flex-col gap-1 text-sm">
								Tipo
								<select className={FIELD} value={kind} onChange={(e) => setKind(e.target.value)}>
									{KINDS.map((k) => (
										<option key={k}>{k}</option>
									))}
								</select>
							</label>
							<label className="flex flex-col gap-1 text-sm">
								Título
								<input
									className={FIELD}
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Ej. Revisión del proyecto"
								/>
							</label>
						</>
					)}

					{step === 1 && (
						<>
							<label className="flex flex-col gap-1 text-sm">
								Fecha
								<input
									type="date"
									className={FIELD}
									value={day}
									onChange={(e) => setDay(e.target.value)}
								/>
							</label>
							<div className="flex gap-3">
								<label className="flex flex-1 flex-col gap-1 text-sm">
									Hora
									<input
										type="time"
										className={FIELD}
										value={hour}
										onChange={(e) => setHour(e.target.value)}
									/>
								</label>
								<label className="flex flex-1 flex-col gap-1 text-sm">
									Duración
									<select
										className={FIELD}
										value={duration}
										onChange={(e) => setDuration(Number(e.target.value))}
									>
										{DURATIONS.map((d) => (
											<option key={d} value={d}>
												{d} min
											</option>
										))}
									</select>
								</label>
							</div>
						</>
					)}

					{step === 2 && (
						<>
							<label className="flex flex-col gap-1 text-sm">
								Lugar (opcional)
								<input
									className={FIELD}
									value={place}
									onChange={(e) => setPlace(e.target.value)}
									placeholder="Ej. Sala 3 o enlace de la videollamada"
								/>
							</label>
							<label className="flex flex-col gap-1 text-sm">
								Invitados (opcional)
								<input
									className={FIELD}
									value={guests}
									onChange={(e) => setGuests(e.target.value)}
									placeholder="Ej. Ana, Pedro"
								/>
							</label>
						</>
					)}
				</div>
			)}

			{status === 'added' ? (
				<p className="text-sm text-neutral-500">✅ Agregado al calendario (simulado)</p>
			) : (
				<div className="flex gap-2">
					<button
						type="button"
						className="rounded-full px-4 py-2.5 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 cursor-pointer"
						disabled={step === 0}
						onClick={() => setStep(step - 1)}
					>
						Atrás
					</button>
					{isSummary && (
						<button
							type="button"
							className="rounded-full border border-neutral-300 px-5 py-2.5 text-neutral-800 hover:bg-neutral-100 cursor-pointer"
							onClick={discard}
						>
							Descartar
						</button>
					)}
					<button
						type="button"
						className="flex-1 rounded-full bg-white text-black py-2.5 disabled:opacity-40 cursor-pointer"
						disabled={!canContinue}
						onClick={() => (isSummary ? add() : setStep(step + 1))}
					>
						{isSummary ? 'Agregar al calendario' : 'Siguiente'}
					</button>
				</div>
			)}
		</div>
	)
}
