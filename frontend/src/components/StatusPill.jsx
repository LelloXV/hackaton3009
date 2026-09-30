import { STATUS_STYLES } from '../trust'

// Status of one trust criterion (OK / Partial / Stale / Missing / Conflict).
export default function StatusPill({ status }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.missing
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap font-medium ${s.text}`}>
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${s.bg} ring-1 ring-current`}
      >
        {s.icon}
      </span>
      {s.label}
    </span>
  )
}
