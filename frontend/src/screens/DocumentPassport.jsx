import { useEffect, useState } from 'react'
import { getPassport, verifySource } from '../api'
import { SOURCE_TYPE_LABELS, formatDate } from '../trust'

// Shows a backend Passport (service/functions/src/types.ts).
export default function DocumentPassport({ passportId, currentUser, onVerified, onClose }) {
  const [passport, setPassport] = useState(null)
  const [error, setError] = useState(null)
  const [justVerified, setJustVerified] = useState(false)

  useEffect(() => {
    getPassport(passportId).then(setPassport)
  }, [passportId])

  if (!passport) return null

  // Same rule as the backend: the owner is the user whose email is owner.contact.
  const isOwner = passport.owner?.contact.toLowerCase() === currentUser.email.toLowerCase()
  const editedAfterVerification =
    passport.lastVerifiedAt && new Date(passport.lastEditedAt) > new Date(passport.lastVerifiedAt)

  async function handleVerify() {
    setError(null)
    try {
      const { lastVerifiedAt } = await verifySource(passport.id, currentUser)
      setPassport({ ...passport, lastVerifiedAt })
      setJustVerified(true)
      onVerified()
    } catch (err) {
      setError(err.message)
    }
  }

  const events = [
    { at: passport.ingestedAt, label: `Added to the knowledge base by ${passport.ingestedBy}` },
    { at: passport.lastEditedAt, label: 'Content last edited' },
    passport.lastVerifiedAt && { at: passport.lastVerifiedAt, label: 'Verified by the owner' },
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.at) - new Date(a.at))

  const { countries, clients, modules } = passport.scope

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-base font-semibold text-slate-800">{passport.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
          {SOURCE_TYPE_LABELS[passport.sourceType] ?? passport.sourceType}
        </p>

        <dl className="mt-5 space-y-3 text-sm">
          <Row
            label="Owner"
            value={passport.owner ? `${passport.owner.name} (${passport.owner.team})` : '— none assigned'}
            warn={!passport.owner}
          />
          <Row label="Last edited" value={formatDate(passport.lastEditedAt)} />
          <Row
            label="Last verified"
            value={formatDate(passport.lastVerifiedAt) ?? '— never verified'}
            warn={!passport.lastVerifiedAt || editedAfterVerification}
          />
          <Row label="Review every" value={`${passport.reviewIntervalDays} days`} />
          <Row label="Country" value={countries.join(', ')} />
          <Row label="Client" value={clients.length ? clients.join(', ') : 'All clients'} />
          <Row label="Module" value={modules.length ? modules.join(', ') : '—'} />
        </dl>

        {editedAfterVerification && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            ⚠ Edited after its last verification: the latest change has not been checked.
          </p>
        )}

        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">Timeline</h3>
        <ol className="mt-2 space-y-2 border-l border-slate-200 pl-4">
          {events.map((e) => (
            <li key={e.label} className="text-sm">
              <span className="text-slate-400">{formatDate(e.at)}</span>
              <span className="ml-2 text-slate-700">{e.label}</span>
            </li>
          ))}
        </ol>

        <p className="mt-4 break-all text-[11px] text-slate-400">Fingerprint (SHA-256): {passport.sha256}</p>

        {justVerified ? (
          <p className="mt-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            ✓ Confirmed. The scores in the answer have been updated.
          </p>
        ) : isOwner ? (
          <button
            onClick={handleVerify}
            className="mt-6 w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Confirm still valid
          </button>
        ) : (
          <p className="mt-6 text-xs text-slate-400">
            Only {passport.owner?.name ?? 'the owner'} can confirm this source is still valid.
          </p>
        )}
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </div>
    </div>
  )
}

function Row({ label, value, warn }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className={`text-right font-medium ${warn ? 'text-rose-600' : 'text-slate-700'}`}>{value}</dd>
    </div>
  )
}
