const STYLES = {
  alta: { label: 'Alta', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  media: { label: 'Media', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  bassa: { label: 'Bassa', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
}

// Never rely on color alone: dot + word + (optional) score, so it reads even
// for colorblind judges glancing at a slide.
export default function TrustBadge({ level, score }) {
  const s = STYLES[level] ?? STYLES.media
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
      {typeof score === 'number' && <span className="text-[11px] opacity-70">· {score}</span>}
    </span>
  )
}
