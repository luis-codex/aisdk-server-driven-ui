import { useRef, useState } from 'react'
import type { ProductTask } from '@/backend/domain/product-tasks'

type Category = { id: string; name: string; icon: string; count: number }
type Props = {
	phase: 'gerencia' | 'categorias' | 'productos' | 'evidencia'
	categories: Category[]
	category?: Category
	products: ProductTask[]
	product?: ProductTask
	completed?: boolean
	onAction?: (text: string) => void
}

const CARD = 'rounded-3xl bg-white text-neutral-900 border border-neutral-200'
const badgeClass = (status: string) =>
	status === 'Sin stock'
		? 'bg-red-100 text-red-700'
		: status === 'Plan Pérdida'
			? 'bg-neutral-900 text-white'
			: 'bg-blue-100 text-blue-700'

export const ProductTaskManager: React.FC<Props> = ({
	phase,
	categories,
	category,
	products,
	product,
	completed,
	onAction,
}) => {
	const [selected, setSelected] = useState(false)
	const [activeProductIndex, setActiveProductIndex] = useState(0)
	const productsScroller = useRef<HTMLDivElement>(null)
	const productCards = useRef<(HTMLButtonElement | null)[]>([])
	const [photo, setPhoto] = useState<string>()
	const [finished, setFinished] = useState(false)
	const choose = (text: string) => {
		setSelected(true)
		onAction?.(text)
	}
	const finalize = (withPhoto: boolean) => {
		if (!product) return
		setFinished(true)
		choose(
			`Finalizo la tarea del SKU ${product.sku} ${withPhoto ? 'con foto de evidencia' : 'sin evidencia'}.`
		)
	}
	const updateActiveProduct = () => {
		const scroller = productsScroller.current
		if (!scroller) return
		const scrollerLeft = scroller.getBoundingClientRect().left
		let nearestIndex = 0
		let nearestDistance = Number.POSITIVE_INFINITY
		productCards.current.forEach((card, index) => {
			if (!card) return
			const distance = Math.abs(card.getBoundingClientRect().left - scrollerLeft)
			if (distance < nearestDistance) {
				nearestDistance = distance
				nearestIndex = index
			}
		})
		setActiveProductIndex(nearestIndex)
	}
	const scrollToProduct = (index: number) => {
		productCards.current[index]?.scrollIntoView({
			behavior: 'smooth',
			block: 'nearest',
			inline: 'start',
		})
	}
	return (
		<div className="flex flex-col gap-3">
			{phase === 'gerencia' && (
				<button
					type="button"
					disabled={selected}
					onClick={() => choose('Elijo la gerencia: Jardín y temporada')}
					className={`${CARD} flex items-center gap-4 p-4 text-left disabled:opacity-60`}
				>
					<span className="text-3xl">🌱</span>
					<b className="flex-1">Jardín y temporada</b>
					<span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
						{categories.reduce((n, c) => n + c.count, 0)}
					</span>
					<span>›</span>
				</button>
			)}
			{phase === 'categorias' && (
				<div className={`${CARD} divide-y divide-neutral-200 overflow-hidden`}>
					{categories.map((c) => (
						<button
							type="button"
							key={c.id}
							disabled={selected || c.count === 0}
							onClick={() => choose(`Elijo la categoría: ${c.name}`)}
							className="flex w-full items-center gap-3 p-4 text-left disabled:opacity-50"
						>
							<span className="text-2xl">{c.icon}</span>
							<span className="flex-1 font-medium">{c.name}</span>
							<span className="rounded-full bg-neutral-100 px-2.5 py-1 text-sm">{c.count}</span>
							<span>›</span>
						</button>
					))}
				</div>
			)}
			{phase === 'productos' && (
				<div className="flex flex-col gap-3">
					{completed && (
						<div className="rounded-2xl bg-neutral-800 p-3 text-sm text-white">
							<span className="mr-2 text-green-400">✓</span>Producto gestionado
						</div>
					)}
					{category && <p className="px-1 text-sm text-neutral-500">{category.name}</p>}
					{products.length === 0 ? (
						<div className={`${CARD} p-4 text-sm text-neutral-500`}>
							No quedan tareas pendientes en esta categoría.
						</div>
					) : (
						<div className="flex flex-col gap-3">
							<div
								ref={productsScroller}
								onScroll={updateActiveProduct}
								className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
								style={{ scrollbarWidth: 'none' }}
							>
								{products.map((p, index) => (
									<button
										type="button"
										key={p.id}
										ref={(element) => {
											productCards.current[index] = element
										}}
										disabled={selected}
										onClick={() => choose(`Gestionar producto SKU ${p.sku} (${p.name})`)}
										className={`${CARD} ${products.length === 1 ? 'w-full' : 'w-[85%] shrink-0'} snap-start overflow-hidden bg-neutral-50 p-3 text-left disabled:opacity-60`}
									>
										<div className="flex flex-wrap gap-1.5">
											{p.status.map((s) => (
												<span
													key={s}
													className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass(s)}`}
												>
													{s}
												</span>
											))}
											<span className="ml-auto text-xs text-neutral-500">⏱ hace 1 hora</span>
										</div>
										<div className="mt-3 flex gap-3">
											<div className="w-16 shrink-0 text-center">
												<div className="grid size-16 place-items-center rounded-2xl bg-white text-4xl">
													{p.emoji}
												</div>
												<span className="text-xs text-neutral-500">{p.quantity} UN</span>
											</div>
											<div className="min-w-0 flex-1">
												<b className="block">{p.name}</b>
												<p className="mt-1 text-sm text-neutral-600">Ubicación: {p.location}</p>
												<p className="text-sm text-neutral-600">
													SKU: {p.sku} · Pallet: {p.pallet}
												</p>
											</div>
											<span className="self-center text-xl">›</span>
										</div>
										<div className="mt-3 border-t border-neutral-200 pt-2 text-xs text-neutral-500">
											<p>Recep. anterior {p.previousReception}</p>
											<p>
												EAN: {p.ean} · UM: {p.unit}
											</p>
										</div>
									</button>
								))}
							</div>
							{products.length > 1 && (
								<div className="relative flex items-center justify-between px-1">
									<button
										type="button"
										aria-label="Producto anterior"
										disabled={activeProductIndex === 0}
										onClick={() => scrollToProduct(activeProductIndex - 1)}
										className="grid size-7 place-items-center rounded-full border border-neutral-200 text-lg leading-none disabled:opacity-30"
									>
										‹
									</button>
									<div className="flex items-center gap-1.5" aria-hidden="true">
										{products.map((p, index) => (
											<span
												key={p.id}
												className={`size-1.5 rounded-full ${index === activeProductIndex ? 'bg-neutral-900' : 'bg-neutral-300'}`}
											/>
										))}
									</div>
									<span className="sr-only">
										Producto {activeProductIndex + 1} de {products.length}
									</span>
									<button
										type="button"
										aria-label="Siguiente producto"
										disabled={activeProductIndex === products.length - 1}
										onClick={() => scrollToProduct(activeProductIndex + 1)}
										className="grid size-7 place-items-center rounded-full border border-neutral-200 text-lg leading-none disabled:opacity-30"
									>
										›
									</button>
								</div>
							)}
						</div>
					)}
				</div>
			)}
			{phase === 'evidencia' && product && (
				<div className={`${CARD} p-4`}>
					<p className="font-semibold">¿Quieres tomar una fotografía de evidencia?</p>
					<p className="mt-1 text-sm text-neutral-500">
						{product.name} · SKU {product.sku}
					</p>
					{photo && (
						<img
							src={photo}
							alt="Vista previa de evidencia"
							className="mt-3 max-h-52 w-full rounded-2xl object-cover"
						/>
					)}
					{!finished && (
						<div className="mt-4 flex flex-col gap-2">
							{!photo && (
								<button
									type="button"
									className="rounded-full border border-neutral-300 py-3"
									onClick={() => finalize(false)}
								>
									Finalizar tarea
								</button>
							)}
							<label className="cursor-pointer rounded-full bg-neutral-900 py-3 text-center text-white">
								{photo ? 'Cambiar foto' : '📷 Tomar fotografía'}
								<input
									type="file"
									accept="image/*"
									capture="environment"
									className="hidden"
									onChange={(e) => {
										const file = e.currentTarget.files?.[0]
										if (file) setPhoto(URL.createObjectURL(file))
										e.currentTarget.value = ''
									}}
								/>
							</label>
							{photo && (
								<button
									type="button"
									className="rounded-full bg-neutral-900 py-3 text-white"
									onClick={() => finalize(true)}
								>
									Finalizar tarea
								</button>
							)}
						</div>
					)}
					{finished && (
						<p className="mt-3 text-sm text-neutral-500">Tarea enviada para finalizar.</p>
					)}
				</div>
			)}
		</div>
	)
}
