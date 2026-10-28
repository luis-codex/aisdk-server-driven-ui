import type { IWeather } from './types'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/** Cliente de Open-Meteo (gratuito, sin API key). */
export class WeatherService {
	public async getCurrent(city: string): Promise<IWeather | null> {
		const place = await this._findPlace(city)
		if (!place) return null

		const params = new URLSearchParams({
			latitude: String(place.latitude),
			longitude: String(place.longitude),
			current:
				'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
		})
		const response = await fetch(`${FORECAST_URL}?${params}`)
		const { current } = await response.json()

		return {
			city: place.name,
			country: place.country,
			temperatureC: current.temperature_2m,
			feelsLikeC: current.apparent_temperature,
			humidityPct: current.relative_humidity_2m,
			windKmh: current.wind_speed_10m,
			weatherCode: current.weather_code,
		}
	}

	private async _findPlace(city: string) {
		const params = new URLSearchParams({ count: '1', language: 'es', name: city })
		const response = await fetch(`${GEOCODING_URL}?${params}`)
		const { results } = await response.json()
		return results?.[0] as
			| { name: string; country: string; latitude: number; longitude: number }
			| undefined
	}
}
