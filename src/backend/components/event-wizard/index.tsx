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

const FIELD =
	'w-full rounded-xl bg-neutral-100 px-3 py-2 outline-none focus:ring-2 focus:ring-neutral-400'

export const EventWizard: React.FC<EventWizardProps> = ({
	title,
	date,
	time,
	location,
	onAction,
}) => {
	const [step, setStep] = useState(0)
	const [done, setDone] = useState(false)
	const [kind, setKind] = useState(KINDS[0]!)
	const [name, setName] = useState(title ?? '')
	const [day, setDay] = useState(date ?? '')
	const [hour, setHour] = useState(time ?? '10:00')
	const [duration, setDuration] = useState(60)
	const [place, setPlace] = useState(location ?? '')
	const [guests, setGuests] = useState('')

	const canContinue =
		step === 0 ? name.trim() !== '' : step === 1 ? day !== '' && hour !== '' : true
	const when = day
		? new Date(`${day}T00:00:00`).toLocaleDateString('es-CL', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
			})
		: ''

	const confirm = () => {
		setDone(true)
		const details = [
			`${kind} "${name.trim()}"`,
			`${when} a las ${hour} (${duration} min)`,
			place.trim() && `en ${place.trim()}`,
			guests.trim() && `con ${guests.trim()}`,
		]
		onAction?.(`Confirmo el evento: ${details.filter(Boolean).join(', ')}.`)
	}

	return (
		<div className="rounded-3xl bg-white text-neutral-900 border border-neutral-200 overflow-hidden">
			<div className="p-4 flex flex-col gap-3">
				<div className="flex gap-1.5">
					{STEPS.map((label, i) => (
						<div
							key={label}
							className={`h-1.5 flex-1 rounded-full ${i <= (done ? STEPS.length : step) ? 'bg-neutral-900' : 'bg-neutral-200'}`}
						/>
					))}
				</div>
				<p className="text-sm text-neutral-500">
					{done ? 'Listo' : `Paso ${step + 1} de ${STEPS.length} · ${STEPS[step]}`}
				</p>

				{!done && step === 0 && (
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

				{!done && step === 1 && (
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

				{!done && step === 2 && (
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

				{(done || step === 3) && (
					<div className="flex flex-col gap-1">
						<p className="text-lg font-semibold">{name.trim()}</p>
						<p className="text-sm text-neutral-600">
							{kind} · {when} · {hour} ({duration} min)
						</p>
						{place.trim() && <p className="text-sm text-neutral-600">📍 {place.trim()}</p>}
						{guests.trim() && <p className="text-sm text-neutral-600">👥 {guests.trim()}</p>}
					</div>
				)}
			</div>

			<div className="border-t border-neutral-200 p-4 flex gap-2">
				{done ? (
					<p className="w-full text-center text-sm text-neutral-500">
						✅ Evento agendado (simulado)
					</p>
				) : (
					<>
						<button
							type="button"
							className="rounded-full border border-neutral-300 px-5 py-2.5 disabled:opacity-40 cursor-pointer"
							disabled={step === 0}
							onClick={() => setStep(step - 1)}
						>
							Atrás
						</button>
						<button
							type="button"
							className="flex-1 rounded-full bg-neutral-900 text-white py-2.5 disabled:opacity-40 cursor-pointer"
							disabled={!canContinue}
							onClick={() => (step === STEPS.length - 1 ? confirm() : setStep(step + 1))}
						>
							{step === STEPS.length - 1 ? 'Agendar' : 'Siguiente'}
						</button>
					</>
				)}
			</div>
		</div>
	)
}
