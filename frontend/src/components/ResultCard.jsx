import StatusPill from './StatusPill'
import TrustBadge from './TrustBadge'
import { byStatus, formatDate } from '../trust'

// One passport found for the question (backend AskResultItem).
// The criteria (the "why") are always visible; archived passports are shown compact.
export default function ResultCard({ result, isMine, onOpenPassport }) {
  const { passport, trust } = result
  const criteria = [...trust.criteria].sort(byStatus)

  return (
    <button
      onClick={() => onOpenPassport(passport.id)}
      className={`w-full rounded-xl border p-4 text-left shadow-sm transition hover:shadow-md ${
        result.archived ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-slate-400">
            [{result.ref}] · Passport {passport.reference}
            {isMine && <span className="ml-2 rounded bg-sky-100 px-1.5 py-0.5 text-sky-800">Your team</span>}
          </span>
          <h3 className="text-sm font-semibold text-slate-800">{passport.title}</h3>
          <p className="text-xs text-slate-500">
            {passport.owner?.name ?? 'No owner'} · updated {formatDate(passport.updatedAt)}
          </p>
        </div>
        {result.archived ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
            <span aria-hidden="true">▣</span> Archived
          </span>
        ) : (
          <TrustBadge level={trust.level} score={trust.score} />
        )}
      </div>

      {result.archived && (
        <p className="mt-2 text-xs text-slate-600">
          No longer relevant since {formatDate(passport.expiresAt)}. Kept for reference, not used for the answer.
        </p>
      )}
      {!result.archived && !result.inScope && (
        <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
          ! Out of scope: {result.scopeNote}. Not used for the answer.
        </p>
      )}

      <p className="mt-2 text-sm text-slate-600">"{result.excerpt}"</p>

      {!result.archived && (
        <ul className="mt-3 space-y-1 border-t border-slate-100 pt-2">
          {criteria.map((c) => (
            <li key={c.id} className="grid grid-cols-[7rem_5.5rem_1fr] items-start gap-2 text-xs">
              <span className="text-slate-500">{c.label}</span>
              <StatusPill status={c.status} />
              <span className="text-slate-600">{c.details}</span>
            </li>
          ))}
        </ul>
      )}
    </button>
  )
}
