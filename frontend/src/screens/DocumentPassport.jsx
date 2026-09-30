import { useEffect, useState } from 'react'
import { confirmStillValid, getClientName, getPassport } from '../api'
import { countryName, formatDate, moduleName } from '../trust'

function scopeText(scope, name) {
  if (scope.mode === 'all') return 'All'
  if (scope.mode === 'unknown') return null
  return scope.values.map(name).join(', ')
}

export default function DocumentPassport({ passportId, currentUser, onClose }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    getPassport(passportId).then(setData)
  }, [passportId])

  if (!data) return null
  const { passport, content } = data
  const isOwner = passport.owner?.id === currentUser.id
  const revoked = passport.stamps.some((s) => s.version === passport.version && s.type === 'revoked')

  async function handleConfirm() {
    setData(await confirmStillValid(passport.id, currentUser))
  }

  const countries = scopeText(passport.visa.countries, countryName)
  const clients = scopeText(passport.visa.clients, getClientName)
  const modules = scopeText(passport.visa.modules, moduleName)

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
          {passport.sourceType} · version {passport.version}
        </p>

        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Owner" value={passport.owner?.name ?? '— none assigned'} warn={!passport.owner} />
          <Row label="Last updated" value={formatDate(passport.updatedAt)} />
          <Row label="Last verified" value={formatDate(passport.lastVerifiedAt) ?? '— never verified'} warn={!passport.lastVerifiedAt} />
          <Row label="Country" value={countries ?? '— unknown'} warn={!countries} />
          <Row label="Client" value={clients ?? '— unknown'} warn={!clients} />
          <Row label="Module" value={modules ?? '— unknown'} warn={!modules} />
          <Row label="Status" value={revoked ? 'Withdrawn' : 'Active'} warn={revoked} />
        </dl>

        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{content}</div>

        {isOwner ? (
          <button
            onClick={handleConfirm}
            className="mt-6 w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Confirm still valid
          </button>
        ) : (
          <p className="mt-6 text-xs text-slate-400">
            Only {passport.owner?.name ?? 'the owner'} can confirm this document is still valid.
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
