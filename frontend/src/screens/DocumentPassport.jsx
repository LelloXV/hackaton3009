import { documents, users } from '../data/mockData'

export default function DocumentPassport({ docId, currentUser, onClose }) {
  const doc = documents.find((d) => d.doc_id === docId)
  if (!doc) return null

  const isOwner = currentUser.role === 'owner' && doc.proprietario === currentUser.name

  return (
    <div className="fixed inset-0 z-20 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-slate-800">{doc.titolo}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{doc.tipo}</p>

        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Proprietario" value={doc.proprietario ?? '— nessuno assegnato'} warn={!doc.proprietario} />
          <Row label="Ultimo aggiornamento" value={doc.ultimo_aggiornamento} />
          <Row label="Ultima verifica" value={doc.ultima_verifica ?? '— mai verificato'} warn={!doc.ultima_verifica} />
          <Row label="Paese" value={doc.paese} />
          <Row label="Cliente" value={doc.cliente ?? '— generico, non specifico al cliente'} warn={!doc.cliente} />
          <Row label="Stato" value={doc.stato} warn={doc.stato === 'superato' || doc.stato === 'nessun proprietario'} />
        </dl>

        {doc.sostituisce && (
          <p className="mt-4 text-xs text-slate-500">Sostituisce: <span className="font-mono">{doc.sostituisce}</span></p>
        )}
        {doc.sostituito_da && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
            ⚠ Superato da <span className="font-mono">{doc.sostituito_da}</span>
          </p>
        )}

        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          {doc.contenuto}
        </div>

        {isOwner ? (
          <button className="mt-6 w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500">
            Conferma che è ancora valido
          </button>
        ) : (
          <p className="mt-6 text-xs text-slate-400">
            Solo {doc.proprietario ?? 'il proprietario'} può confermare la validità di questo documento.
          </p>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, warn }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className={warn ? 'font-medium text-rose-600' : 'font-medium text-slate-700'}>{value}</dd>
    </div>
  )
}
