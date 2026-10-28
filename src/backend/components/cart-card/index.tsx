import { useState } from 'react'
import { CATALOG, SIZES, TAX_RATE, TOPPINGS, type ProductId } from '@/backend/domain/catalog'

export type CartOutput = {
	action: 'purchase' | 'add_to_cart'
	items: { name: string; size: string; topping: string; qty: number; unitPrice: number }[]
	subtotal: number
	tax: number
	total: number
}

type Line = { size: number; topping: number; qty: number }

const money = (n: number) => `$${n.toFixed(2)}`

type CartCardProps = {
	productIds: readonly ProductId[]
	onAction?: (text: string) => void
}

export const CartCard: React.FC<CartCardProps> = ({ productIds, onAction }) => {
	const products = CATALOG.filter((p) => productIds.includes(p.id))
	const [lines, setLines] = useState<Record<string, Line>>(() =>
		Object.fromEntries(products.map((p) => [p.id, { size: 1, topping: 1, qty: 1 }]))
	)
	const [result, setResult] = useState<CartOutput>()
	const done = result !== undefined

	const update = (id: string, patch: Partial<Line>) =>
		setLines((l) => ({ ...l, [id]: { ...l[id]!, ...patch } }))

	const items = products.flatMap((p) => {
		const l = lines[p.id]!
		if (l.qty === 0) return []
		const unitPrice = p.price + SIZES[l.size]!.delta + TOPPINGS[l.topping]!.delta
		return [
			{
				name: p.name,
				size: SIZES[l.size]!.label,
				topping: TOPPINGS[l.topping]!.label,
				qty: l.qty,
				unitPrice,
			},
		]
	})
	const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)
	const tax = Math.round(subtotal * TAX_RATE * 100) / 100
	const total = subtotal + tax

	const submit = (action: CartOutput['action']) => {
		const output = { action, items, subtotal, tax, total }
		setResult(output)
		const detail = items.map((i) => `${i.qty}× ${i.name} (${i.size}, ${i.topping})`).join(', ')
		onAction?.(
			`${action === 'purchase' ? 'Confirmo la compra' : 'Agrégalo al carrito'}: ${detail}. Total ${money(total)}.`
		)
	}

	const shown = result ?? { items, subtotal, tax, total }

	return (
		<div className="rounded-3xl bg-white text-neutral-900 border border-neutral-200 overflow-hidden">
			<div className="p-4 flex flex-col gap-3">
				{done
					? shown.items.map((i, k) => (
							<p key={k} className="text-sm">
								{i.qty}× <b>{i.name}</b> · {i.size} · {i.topping} · {money(i.unitPrice)}
							</p>
						))
					: products.map((p) => {
							const l = lines[p.id]!
							return (
								<div key={p.id} className="flex gap-3 items-center">
									<div
										className="size-14 shrink-0 rounded-xl grid place-items-center text-3xl"
										style={{ background: p.color + '33' }}
									>
										{p.emoji}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold truncate">{p.name}</p>
										<div className="flex gap-1.5 mt-1">
											<select
												className="text-sm bg-neutral-100 rounded px-1 py-0.5"
												value={l.size}
												onChange={(e) => update(p.id, { size: +e.target.value })}
											>
												{SIZES.map((s, i) => (
													<option key={s.label} value={i}>
														{s.label}
													</option>
												))}
											</select>
											<select
												className="text-sm bg-neutral-100 rounded px-1 py-0.5"
												value={l.topping}
												onChange={(e) => update(p.id, { topping: +e.target.value })}
											>
												{TOPPINGS.map((t, i) => (
													<option key={t.label} value={i}>
														{t.label}
													</option>
												))}
											</select>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<button
											type="button"
											className="size-7 rounded-full bg-neutral-100 cursor-pointer"
											onClick={() => update(p.id, { qty: Math.max(0, l.qty - 1) })}
										>
											−
										</button>
										<span className="w-4 text-center">{l.qty}</span>
										<button
											type="button"
											className="size-7 rounded-full bg-neutral-100 cursor-pointer"
											onClick={() => update(p.id, { qty: Math.min(9, l.qty + 1) })}
										>
											+
										</button>
									</div>
								</div>
							)
						})}
			</div>

			<div className="border-t border-neutral-200 p-4 text-sm flex flex-col gap-1">
				<div className="flex justify-between">
					<span>Subtotal</span>
					<span>{money(shown.subtotal)}</span>
				</div>
				<div className="flex justify-between">
					<span>Impuesto ({(TAX_RATE * 100).toFixed(2)}%)</span>
					<span>{money(shown.tax)}</span>
				</div>
				<div className="flex justify-between font-bold">
					<span>Total</span>
					<span>{money(shown.total)}</span>
				</div>
			</div>

			<div className="border-t border-neutral-200 p-4 flex flex-col gap-2">
				{done ? (
					<p className="text-center text-sm text-neutral-500">
						{result.action === 'purchase'
							? '✅ Compra simulada confirmada'
							: '🛒 Agregado al carrito'}
					</p>
				) : (
					<>
						<button
							type="button"
							className="rounded-full bg-neutral-900 text-white py-3 disabled:opacity-40 cursor-pointer"
							disabled={items.length === 0}
							onClick={() => submit('purchase')}
						>
							Comprar
						</button>
						<button
							type="button"
							className="rounded-full border border-neutral-300 py-3 disabled:opacity-40 cursor-pointer"
							disabled={items.length === 0}
							onClick={() => submit('add_to_cart')}
						>
							Agregar al carrito
						</button>
					</>
				)}
			</div>
		</div>
	)
}
