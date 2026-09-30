import AppIcon from '../components/AppIcon'
import { formatDate } from '../trust'

// Side-by-side comparison of a backend Conflict: what each side says, where they
// differ, and who can clarify.
export default function ConflictPanel({ conflict, items, onOpenPassport, onClose }) {
  const expert = conflict.resolveWith
  const itemOf = (passportId) => items.find((i) => i.passportId === passportId)

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">⚠ Sources disagree</h2>
            <p className="mt-0.5 text-sm text-slate-500">{conflict.topic}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {conflict.positions.map((position, i) => (
            <div key={position.claim} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source {String.fromCharCode(65 + i)} says
                {position.claim === conflict.leadingClaim && ' · most support'}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">{position.claim}</p>
              <p className="text-xs text-slate-500">
                {position.evidence.length} source{position.evidence.length > 1 ? 's' : ''} · combined trust {position.support}
              </p>
              {position.evidence.map((e) => (
                <div key={e.linkedSourceId} className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <AppIcon app={e.app} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{e.title}</p>
                      <p className="text-xs text-slate-500">{[e.app, formatDate(e.date)].filter(Boolean).join(' · ')}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">"{e.excerpt}"</p>
                  <p className="mt-1 flex flex-wrap gap-x-3 text-xs">
                    {e.passportIds.map((id) => (
                      <button key={id} onClick={() => onOpenPassport(id)} className="font-medium text-sky-700 hover:underline">
                        [{itemOf(id)?.ref}] {itemOf(id)?.passport.title ?? id} →
                      </button>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <p className="font-medium">Where they differ</p>
          <p className="mt-0.5">{conflict.difference}</p>
        </div>

        {expert && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4">
            <div>
              <p className="text-xs text-slate-400">Who can clarify</p>
              <p className="text-sm font-medium text-slate-800">{expert.name}{expert.unit && ` · ${expert.unit}`}</p>
              {expert.expertise.length > 0 && <p className="text-xs text-slate-500">Expertise: {expert.expertise.join(', ')}</p>}
              <p className="text-xs text-slate-500">{expert.reason}</p>
            </div>
            <p className="text-xs text-slate-500">{expert.contact}</p>
          </div>
        )}
      </div>
    </div>
  )
}
