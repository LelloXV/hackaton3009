const STYLES = {
  high: { label: 'High', icon: '✓', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  medium: { label: 'Medium', icon: '~', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  low: { label: 'Low', icon: '!', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
  none: { label: 'None', icon: '–', chip: 'bg-slate-100 text-slate-600 ring-slate-200' },
}

// Never rely on color alone: icon + word + (optional) score.
export default function TrustBadge({ level, score, prefix }) {
  const s = STYLES[level] ?? STYLES.none
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${s.chip}`}>
      <span aria-hidden="true" className="font-bold">{s.icon}</span>
      {prefix && <span>{prefix}</span>}
      {s.label}
      {typeof score === 'number' && <span className="opacity-70">· {score}</span>}
    </span>
  )
}
