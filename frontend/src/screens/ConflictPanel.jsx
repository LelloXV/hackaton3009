import { documents, users } from '../data/mockData'

export default function ConflictPanel({ conflitto, onOpenPassport, onClose }) {
  const docA = documents.find((d) => d.doc_id === conflitto.fonte_a.doc_id)
  const docB = documents.find((d) => d.doc_id === conflitto.fonte_b.doc_id)
  const esperto = users.find((u) => u.id === conflitto.chi_chiarisce.user_id)

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-slate-800">⚠ {conflitto.titolo}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ConflictSide label="Fonte A" doc={docA} estratto={conflitto.fonte_a.estratto} onOpenPassport={onOpenPassport} />
          <ConflictSide label="Fonte B" doc={docB} estratto={conflitto.fonte_b.estratto} onOpenPassport={onOpenPassport} />
        </div>

        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{conflitto.nota}</p>

        <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 p-3">
          <div>
            <p className="text-xs text-slate-400">Chi può chiarire</p>
            <p className="text-sm font-medium text-slate-800">{esperto?.name}</p>
            <p className="text-xs text-slate-500">{conflitto.chi_chiarisce.motivo}</p>
          </div>
          <button className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
            Contatta
          </button>
        </div>
      </div>
    </div>
  )
}

function ConflictSide({ label, doc, estratto, onOpenPassport }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <button
        onClick={() => onOpenPassport(doc.doc_id)}
        className="mt-1 text-sm font-semibold text-slate-800 underline decoration-dotted underline-offset-2 hover:text-slate-600"
      >
        {doc.titolo}
      </button>
      <p className="mt-2 text-sm text-slate-600">"{estratto}"</p>
      <p className="mt-2 text-xs text-slate-400">Aggiornato: {doc.ultimo_aggiornamento}</p>
    </div>
  )
}
