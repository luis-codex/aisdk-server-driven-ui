export type ProductTask = {
	id: string
	name: string
	emoji: string
	quantity: number
	status: string[]
	location: string
	sku: string
	pallet: string
	previousReception: string
	ean: string
	unit: string
}

export type ProductTaskCategory = {
	id: string
	name: string
	icon: string
	products: ProductTask[]
}

export const PRODUCT_TASK_CATEGORIES: ProductTaskCategory[] = [
	{
		id: 'garden-tools',
		name: 'Herramientas de jardín',
		icon: '🪴',
		products: [
			{
				id: '750319P',
				name: 'Pala jardín mango madera',
				emoji: '🪏',
				quantity: 200,
				status: ['Sin stock', 'Plan Pérdida'],
				location: 'P19R08',
				sku: '750319P',
				pallet: '52584',
				previousReception: 'Lun 19 nov. 2021 · 12:33 hrs',
				ean: '7802800500611',
				unit: 'unidades',
			},
			{
				id: '750422R',
				name: 'Tijera de podar reforzada',
				emoji: '✂️',
				quantity: 18,
				status: ['Campaña'],
				location: 'P19R10',
				sku: '750422R',
				pallet: '52601',
				previousReception: 'Mar 20 nov. 2021 · 09:18 hrs',
				ean: '7802800500628',
				unit: 'unidades',
			},
			{
				id: '751003M',
				name: 'Manguera jardín 15 m',
				emoji: '🌀',
				quantity: 36,
				status: ['Campaña'],
				location: 'P20R02',
				sku: '751003M',
				pallet: '52613',
				previousReception: 'Mié 21 nov. 2021 · 10:02 hrs',
				ean: '7802800500635',
				unit: 'unidades',
			},
		],
	},
	{
		id: 'tools',
		name: 'Herramientas',
		icon: '🛠️',
		products: [
			{
				id: '810205A',
				name: 'Guantes de trabajo nitrilo',
				emoji: '🧤',
				quantity: 42,
				status: ['Plan Pérdida'],
				location: 'H04R11',
				sku: '810205A',
				pallet: '61203',
				previousReception: 'Vie 23 nov. 2021 · 11:05 hrs',
				ean: '7802800600217',
				unit: 'pares',
			},
			{
				id: '810330B',
				name: 'Taladro percutor 650 W',
				emoji: '🔩',
				quantity: 9,
				status: ['Campaña'],
				location: 'H05R03',
				sku: '810330B',
				pallet: '61221',
				previousReception: 'Sáb 24 nov. 2021 · 13:40 hrs',
				ean: '7802800600231',
				unit: 'unidades',
			},
		],
	},
	{
		id: 'home',
		name: 'Hogar y muebles',
		icon: '🛋️',
		products: [
			{
				id: '920110C',
				name: 'Silla plegable exterior',
				emoji: '🪑',
				quantity: 12,
				status: ['Campaña'],
				location: 'M11R06',
				sku: '920110C',
				pallet: '73108',
				previousReception: 'Lun 26 nov. 2021 · 08:22 hrs',
				ean: '7802800700316',
				unit: 'unidades',
			},
			{
				id: '920224D',
				name: 'Macetero cerámico 30 cm',
				emoji: '🪴',
				quantity: 24,
				status: ['Sin stock'],
				location: 'M12R09',
				sku: '920224D',
				pallet: '73119',
				previousReception: 'Mar 27 nov. 2021 · 14:10 hrs',
				ean: '7802800700330',
				unit: 'unidades',
			},
		],
	},
	{
		id: 'construction',
		name: 'Construcción',
		icon: '🧱',
		products: [
			{
				id: '630041E',
				name: 'Cemento uso general 25 kg',
				emoji: '🧱',
				quantity: 30,
				status: ['Plan Pérdida'],
				location: 'C02R04',
				sku: '630041E',
				pallet: '44012',
				previousReception: 'Mié 28 nov. 2021 · 07:55 hrs',
				ean: '7802800800415',
				unit: 'sacos',
			},
			{
				id: '630117F',
				name: 'Pintura exterior blanca 1 gal',
				emoji: '🪣',
				quantity: 8,
				status: ['Campaña'],
				location: 'C03R12',
				sku: '630117F',
				pallet: '44026',
				previousReception: 'Jue 29 nov. 2021 · 16:32 hrs',
				ean: '7802800800439',
				unit: 'unidades',
			},
		],
	},
	{
		id: 'finishes',
		name: 'Terminaciones',
		icon: '🧰',
		products: [
			{
				id: '540091G',
				name: 'Piso vinílico roble claro',
				emoji: '🪵',
				quantity: 16,
				status: ['Campaña'],
				location: 'T07R01',
				sku: '540091G',
				pallet: '33807',
				previousReception: 'Vie 30 nov. 2021 · 12:04 hrs',
				ean: '7802800900514',
				unit: 'cajas',
			},
			{
				id: '540205H',
				name: 'Grifería lavamanos cromada',
				emoji: '🚰',
				quantity: 6,
				status: ['Sin stock', 'Plan Pérdida'],
				location: 'T08R05',
				sku: '540205H',
				pallet: '33819',
				previousReception: 'Sáb 1 dic. 2021 · 09:44 hrs',
				ean: '7802800900538',
				unit: 'unidades',
			},
		],
	},
]
