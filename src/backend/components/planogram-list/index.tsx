import { useState } from 'react'

export type PlanogramItem = {
	id: string
	eans: string[]
	name: string
	store?: string
	section?: string
	shelf?: string
	status?: string
	deadline?: string
	url?: string
}

export type PlanogramListProps = {
	planograms: PlanogramItem[]
	notFoundEans: string[]
	onAction?: (text: string) => void
}

export const PlanogramList: React.FC<PlanogramListProps> = ({ planograms, notFoundEans }) => {
	const [selected, setSelected] = useState<string>()
	const count = planograms.length

	return (
		<div className="rounded-3xl bg-white text-neutral-900 border border-neutral-200 overflow-hidden">
			<p className="px-4 pt-3 pb-2 text-sm text-neutral-500">
				{count === 0 ? 'Sin planogramas' : `${count} ${count === 1 ? 'planograma' : 'planogramas'}`}
			</p>

			{count > 0 && (
				<ul className="flex flex-col gap-1.5 px-3 pb-3 max-h-72 overflow-y-auto">
					{planograms.map((p) => {
						const isSelected = selected === p.id
						const detail = [p.eans.join(', '), p.section, p.shelf, p.status]
							.filter(Boolean)
							.join(' · ')
						return (
							<li key={p.id}>
								<div
									className={`flex items-center gap-2 rounded-2xl pr-2 border border-dashed transition-colors ${
										isSelected ? 'border-blue-500 bg-white' : 'border-transparent bg-neutral-100'
									}`}
								>
									<button
										type="button"
										className="flex-1 min-w-0 flex items-center gap-3 text-left py-2 pl-3 cursor-pointer"
										aria-pressed={isSelected}
										onClick={() => setSelected(isSelected ? undefined : p.id)}
									>
										<span className="w-1 self-stretch rounded-full bg-blue-500 shrink-0" />
										<span className="min-w-0">
											<span className="block text-sm font-medium truncate">{p.name}</span>
											<span className="block text-xs text-neutral-500 truncate">{detail}</span>
										</span>
									</button>
									{p.url && (
										<a
											href={p.url}
											target="_blank"
											rel="noopener noreferrer"
											className="shrink-0 rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs"
										>
											Abrir ↗
										</a>
									)}
								</div>
							</li>
						)
					})}
				</ul>
			)}

			{notFoundEans.length > 0 && (
				<p className="px-4 pb-3 text-xs text-neutral-500">
					Sin planograma: {notFoundEans.join(', ')}
				</p>
			)}
		</div>
	)
}
