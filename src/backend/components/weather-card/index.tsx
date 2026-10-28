import { useEffect, useState } from 'react'

const CONDITIONS: Record<number, [string, string]> = {
	0: ['☀️', 'Cielo despejado'],
	1: ['🌤️', 'Mayormente despejado'],
	2: ['⛅', 'Parcialmente nublado'],
	3: ['☁️', 'Nublado'],
	45: ['🌫️', 'Niebla'],
	48: ['🌫️', 'Niebla con escarcha'],
	51: ['🌦️', 'Llovizna ligera'],
	61: ['🌧️', 'Lluvia ligera'],
	63: ['🌧️', 'Lluvia moderada'],
	65: ['🌧️', 'Lluvia fuerte'],
	71: ['🌨️', 'Nieve ligera'],
	80: ['🌦️', 'Chubascos'],
	95: ['⛈️', 'Tormenta'],
}

export type WeatherCardProps = {
	city: string
	temperatureC: number
	feelsLikeC: number
	humidityPct: number
	windKmh: number
	weatherCode: number
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
	city,
	temperatureC,
	feelsLikeC,
	humidityPct,
	windKmh,
	weatherCode,
}) => {
	const [icon, label] = CONDITIONS[weatherCode] ?? ['🌡️', 'Condición desconocida']
	const [fahrenheit, setFahrenheit] = useState(false)
	// useEffect solo corre en el cliente, después de hidratar: el server nunca lo ve.
	const [hydrated, setHydrated] = useState(false)
	useEffect(() => setHydrated(true), [])
	const show = (c: number) => Math.round(fahrenheit ? c * 1.8 + 32 : c)
	return (
		<div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-400 text-white p-6 text-center">
			<div className="flex items-center justify-center gap-4">
				<span className="text-6xl">{icon}</span>
				<span className="text-6xl font-light">{show(temperatureC)}°</span>
			</div>
			<p className="mt-3">{city}</p>
			<p className="mt-2 text-lg">
				{label}. Sensación de {show(feelsLikeC)}°, humedad {humidityPct}% y viento de {windKmh}{' '}
				km/h.
			</p>
			<div className="mt-4 flex items-center justify-center gap-3 text-sm">
				<button
					type="button"
					className="rounded-full bg-white/20 px-3 py-1 cursor-pointer"
					onClick={() => setFahrenheit((f) => !f)}
				>
					Ver en °{fahrenheit ? 'C' : 'F'}
				</button>
				<span className="opacity-70">
					{hydrated ? '⚡ hidratada: interactiva' : 'HTML del server'}
				</span>
			</div>
		</div>
	)
}
