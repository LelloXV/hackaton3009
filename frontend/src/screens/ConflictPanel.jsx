import { useEffect, useState } from 'react'
import { getPassport } from '../api'
import { formatDate } from '../trust'

export default function ConflictPanel({ conflict, onOpenPassport, onClose }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-slate-800">⚠ {conflict.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ConflictSide label="Source A" side={conflict.sourceA} onOpenPassport={onOpenPassport} />
          <ConflictSide label="Source B" side={conflict.sourceB} onOpenPassport={onOpenPassport} />
        </div>

        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{conflict.difference}</p>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <div>
            <p className="text-xs text-slate-400">Who can clarify</p>
            <p className="text-sm font-medium text-slate-800">{conflict.expert.name}</p>
            <p className="text-xs text-slate-500">{conflict.expert.reason}</p>
          </div>
          <button className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
            Contact
          </button>
        </div>
      </div>
    </div>
  )
}

function ConflictSide({ label, side, onOpenPassport }) {
  const [passport, setPassport] = useState(null)

  useEffect(() => {
    getPassport(side.passportId).then((result) => setPassport(result?.passport ?? null))
  }, [side.passportId])

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label} · [{side.ref}]</p>
      <button
        onClick={() => onOpenPassport(side.passportId)}
        className="mt-1 text-left text-sm font-semibold text-slate-800 underline decoration-dotted underline-offset-2 hover:text-slate-600"
      >
        {passport?.title ?? '…'}
      </button>
      <p className="mt-2 text-sm text-slate-600">"{side.excerpt}"</p>
      {passport && <p className="mt-2 text-xs text-slate-400">Updated: {formatDate(passport.updatedAt)}</p>}
    </div>
  )
}
