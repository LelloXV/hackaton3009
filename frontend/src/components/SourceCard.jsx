import TrustBadge from './TrustBadge'
import {
  BREAKDOWN_LABELS,
  BREAKDOWN_MAX,
  SOURCE_TYPE_LABELS,
  VERIFICATION_LABELS,
  parseReason,
  sourceLevel,
} from '../trust'

// One retrieved source (backend ScoredSource). Reasons are always visible.
export default function SourceCard({ source, refNumber, isMine, onOpenPassport }) {
  return (
    <button
      onClick={() => onOpenPassport(source.passportId)}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-slate-400">
            [{refNumber}] · {SOURCE_TYPE_LABELS[source.sourceType] ?? source.sourceType}
            {isMine && <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-sky-800">You own this</span>}
          </span>
          <h3 className="text-sm font-semibold text-slate-800">{source.title}</h3>
        </div>
        <TrustBadge level={sourceLevel(source)} score={source.score} />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {VERIFICATION_LABELS[source.verificationStatus]}
        {!source.inScope && ' · Out of scope'}
      </p>

      <ul className="mt-2 space-y-1">
        {source.reasons.map((reason) => {
          const r = parseReason(reason)
          return (
            <li key={reason} className={`flex items-start gap-1.5 text-xs ${r.ok ? 'text-slate-600' : 'text-rose-600'}`}>
              <span aria-hidden="true">{r.ok ? '✓' : '✗'}</span>
              <span>{r.text}</span>
            </li>
          )
        })}
      </ul>

      <dl className="mt-3 grid grid-cols-5 gap-1 border-t border-slate-100 pt-2 text-center">
        {Object.entries(source.breakdown).map(([factor, points]) => (
          <div key={factor}>
            <dt className="truncate text-[10px] text-slate-400">{BREAKDOWN_LABELS[factor] ?? factor}</dt>
            <dd className="text-xs font-medium text-slate-700">
              {points}
              {BREAKDOWN_MAX[factor] && <span className="text-slate-400">/{BREAKDOWN_MAX[factor]}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </button>
  )
}
