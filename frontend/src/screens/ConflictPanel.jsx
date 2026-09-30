// Side-by-side view of a backend Conflict: each position, the sources behind it,
// and who can resolve it.
export default function ConflictPanel({ conflict, sources, onOpenPassport, onClose }) {
  const refOf = (passportId) => sources.findIndex((s) => s.passportId === passportId) + 1
  const sourceOf = (passportId) => sources.find((s) => s.passportId === passportId)
  const expert = conflict.resolveWith

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
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {conflict.positions.map((position, i) => (
            <div key={position.claim} className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source {String.fromCharCode(65 + i)}
                {position.claim === conflict.leadingClaim && ' · better supported'}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-800">{position.claim}</p>
              <p className="text-xs text-slate-500">
                Combined trust {position.support} from {position.passportIds.length} source(s)
              </p>
              {position.passportIds.map((id) => {
                const source = sourceOf(id)
                return (
                  <div key={id} className="mt-3 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => onOpenPassport(id)}
                      className="text-left text-sm font-semibold text-slate-800 underline decoration-dotted underline-offset-2 hover:text-slate-600"
                    >
                      [{refOf(id)}] {source?.title ?? id}
                    </button>
                    {source && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">"{source.excerpt}"</p>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Where they differ: {conflict.positions.map((p) => p.claim).join(' vs ')}.
          The position with more combined trust ({conflict.leadingClaim}) leads, but both are shown until a person resolves it.
        </p>

        {expert && (
          <div className="mt-5 rounded-lg border border-slate-200 p-3">
            <p className="text-xs text-slate-400">Who can clarify</p>
            <p className="text-sm font-medium text-slate-800">{expert.name}</p>
            <p className="text-xs text-slate-500">{expert.team} · {expert.contact}</p>
          </div>
        )}
      </div>
    </div>
  )
}
