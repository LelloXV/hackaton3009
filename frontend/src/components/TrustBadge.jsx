import { LEVEL_STYLES } from '../trust'

// Never rely on color alone: icon + word + (optional) score.
export default function TrustBadge({ level, score, prefix }) {
  const s = LEVEL_STYLES[level] ?? LEVEL_STYLES.none
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${s.chip}`}>
      <span aria-hidden="true" className="font-bold">{s.icon}</span>
      {prefix && <span>{prefix}</span>}
      {s.label}
      {typeof score === 'number' && <span className="opacity-70">· {score}%</span>}
    </span>
  )
}
