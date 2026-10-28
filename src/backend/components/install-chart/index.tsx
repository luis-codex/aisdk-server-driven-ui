export type InstallDay = { label: string; desktop: number; android: number; ios: number }

const W = 400
const H = 270
const PAD = { l: 38, r: 8, t: 10, b: 28 }
const MAX = 600
const COLORS = { desktop: '#3b82f6', android: '#e5534b', ios: '#f08f8a' }

type InstallChartProps = { days: InstallDay[] }

export const InstallChart: React.FC<InstallChartProps> = ({ days }) => {
	const innerW = W - PAD.l - PAD.r
	const innerH = H - PAD.t - PAD.b
	const y = (v: number) => PAD.t + innerH - (v / MAX) * innerH
	const slot = innerW / days.length
	const barW = slot * 0.36

	return (
		<div className="rounded-3xl bg-white text-neutral-900 border border-neutral-200 p-5">
			<div className="flex justify-between items-start">
				<div>
					<h3 className="text-xl font-semibold">Mix de instalaciones</h3>
					<p className="text-neutral-500">Escritorio vs móvil</p>
				</div>
				<span className="text-neutral-400">Últimos {days.length} días</span>
			</div>

			<svg
				viewBox={`0 0 ${W} ${H}`}
				className="w-full mt-3"
				role="img"
				aria-label="Instalaciones por plataforma"
			>
				{[0, 150, 300, 450, 600].map((t) => (
					<g key={t}>
						<line
							x1={PAD.l}
							x2={W - PAD.r}
							y1={y(t)}
							y2={y(t)}
							stroke="#e5e5e5"
							strokeDasharray={t === 0 ? undefined : '4 4'}
						/>
						<text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#737373">
							{t}
						</text>
					</g>
				))}
				{days.map((d, i) => {
					const x0 = PAD.l + i * slot + slot * 0.1
					const mobile = d.android + d.ios
					return (
						<g key={d.label}>
							<rect
								x={x0}
								y={y(d.android)}
								width={barW}
								height={y(0) - y(d.android)}
								fill={COLORS.android}
								rx="3"
							/>
							<rect
								x={x0}
								y={y(mobile)}
								width={barW}
								height={y(d.android) - y(mobile)}
								fill={COLORS.ios}
								rx="3"
							/>
							<rect
								x={x0 + barW + 2}
								y={y(d.desktop)}
								width={barW}
								height={y(0) - y(d.desktop)}
								fill={COLORS.desktop}
								rx="3"
							/>
							<text x={x0 + barW} y={H - 8} textAnchor="middle" fontSize="11" fill="#737373">
								{d.label}
							</text>
						</g>
					)
				})}
			</svg>

			<div className="flex justify-center gap-5 mt-2 text-sm">
				{(
					[
						['Escritorio', COLORS.desktop],
						['Android', COLORS.android],
						['iOS', COLORS.ios],
					] as const
				).map(([name, color]) => (
					<span key={name} className="flex items-center gap-1.5">
						<span className="size-3 rounded-sm inline-block" style={{ background: color }} />
						{name}
					</span>
				))}
			</div>
		</div>
	)
}
