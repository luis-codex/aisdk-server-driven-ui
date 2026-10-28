// Catálogo compartido: el server lo usa para el esquema de la tool y el cliente para pintar.
export const CATALOG = [
	{
		id: 'black-sugar-latte',
		name: 'Black Sugar Hoick Latte',
		price: 5.75,
		emoji: '🧋',
		color: '#6b4423',
	},
	{ id: 'classic-milk-tea', name: 'Classic Milk Tea', price: 5.25, emoji: '🥛', color: '#c9a27a' },
	{ id: 'matcha-latte', name: 'Matcha Latte', price: 5.75, emoji: '🍵', color: '#7aa874' },
] as const

export const SIZES = [
	{ label: '12oz', delta: -0.75 },
	{ label: '16oz', delta: 0 },
	{ label: '24oz', delta: 1 },
] as const

export const TOPPINGS = [
	{ label: 'Sin topping', delta: 0 },
	{ label: 'Boba', delta: 0.75 },
	{ label: 'Doble boba', delta: 1.5 },
] as const

export const TAX_RATE = 0.0875

export type ProductId = (typeof CATALOG)[number]['id']
export const PRODUCT_IDS = CATALOG.map((p) => p.id) as [ProductId, ...ProductId[]]
