import TrustBadge from './TrustBadge'

export default function SourceCard({ fonte, doc, onOpenPassport }) {
  return (
    <button
      onClick={() => onOpenPassport(doc.doc_id)}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-slate-400">[{fonte.ref}]</span>
          <h3 className="text-sm font-semibold text-slate-800">{doc.titolo}</h3>
        </div>
        <TrustBadge level={fonte.fiducia} score={fonte.punteggio} />
      </div>
      <ul className="mt-3 space-y-1">
        {fonte.motivi.map((m, i) => (
          <li key={i} className={`flex items-start gap-1.5 text-xs ${m.ok ? 'text-slate-600' : 'text-rose-600'}`}>
            <span>{m.ok ? '✓' : '✗'}</span>
            <span>{m.testo}</span>
          </li>
        ))}
      </ul>
    </button>
  )
}
