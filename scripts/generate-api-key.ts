import { randomBytes } from 'node:crypto'

// Genera una API key y la agrega a API_KEYS en .env (crea la variable si no existe).
const ENV_PATH = new URL('../.env', import.meta.url).pathname

const key = `sk_${randomBytes(24).toString('base64url')}`
const file = Bun.file(ENV_PATH)
const content = (await file.exists()) ? await file.text() : ''
const lines = content.split('\n')
const index = lines.findIndex((line) => line.startsWith('API_KEYS='))

if (index === -1) {
	if (lines.at(-1) === '') lines.pop()
	lines.push(`API_KEYS=${key}`, '')
} else {
	const current = lines[index]!.slice('API_KEYS='.length).trim()
	lines[index] = `API_KEYS=${current ? `${current},${key}` : key}`
}

await Bun.write(ENV_PATH, lines.join('\n'))
console.log(`API key agregada a .env:\n${key}`)
