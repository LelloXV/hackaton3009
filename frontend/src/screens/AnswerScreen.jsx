import { useEffect, useState } from 'react'
import { askQuestion, useMock } from '../api'
import { meta } from '../data/mockData'
import ResultCard from '../components/ResultCard'
import TrustBadge from '../components/TrustBadge'

const COUNTRIES = ['BE', 'NL']

// Turns "text [1] more [2]" into text with clickable citation buttons.
function AnswerText({ text, items, onOpenPassport }) {
  return text.split(/(\[\d+\])/).map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/)
    const item = match && items.find((r) => r.ref === Number(match[1]))
    if (!item) return <span key={i}>{part}</span>
    return (
      <button
        key={i}
        onClick={() => onOpenPassport(item.passportId)}
        title={item.passport.title}
        className="mx-0.5 rounded bg-sky-50 px-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 hover:bg-sky-100"
      >
        {part}
      </button>
    )
  })
}

export default function AnswerScreen({ currentUser, refreshKey, onOpenPassport, onOpenConflict, onLogout }) {
  const [question, setQuestion] = useState(meta.question.question)
  const [country, setCountry] = useState(meta.question.country)
  const [askedQuestion, setAskedQuestion] = useState(meta.question.question)
  const [askCount, setAskCount] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  // Ask again when the question is submitted (even the same one), the country
  // changes, or a passport was confirmed (refreshKey).
  useEffect(() => {
    let current = true
    askQuestion(askedQuestion, { country })
      .then((r) => current && (setResult(r), setError(null)))
      .catch((err) => current && setError(err.message))
      .finally(() => current && setLoading(false))
    return () => {
      current = false
    }
  }, [askedQuestion, country, refreshKey, askCount])

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setAskedQuestion(question)
    setAskCount((n) => n + 1)
  }

  function handleCountry(value) {
    setLoading(true)
    setCountry(value)
  }

  const allItems = result ? [...result.results, ...result.archived] : []
  const myResults = result ? result.results.filter((r) => r.canEdit) : []

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Knowledge Passport</h1>
            <p className="text-sm text-slate-500">
              {currentUser.name} · {currentUser.teams.length > 0 ? currentUser.teams.map((t) => t.name).join(', ') : 'Consultant'}
            </p>
          </div>
          <button onClick={onLogout} className="text-xs text-slate-400 hover:text-slate-700">Sign out</button>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Ask a question…"
          />
          <select
            value={country}
            onChange={(e) => handleCountry(e.target.value)}
            aria-label="Country"
            className="rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm"
          >
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? 'Asking…' : 'Ask'}
          </button>
        </form>
        {useMock && (
          <p className="mt-1 text-xs text-slate-400">Demo mode: every question returns the go-live example for the chosen country.</p>
        )}
        {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        {result && (
          <div className={`mt-6 space-y-6 transition-opacity ${loading ? 'opacity-50' : ''}`}>
            <p className="text-xs text-slate-400">Results for "{result.question}" · {result.context.country ?? 'all countries'}</p>
            {myResults.map((r) => (
              <div
                key={r.passportId}
                className="flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
              >
                <span>
                  Your team owns passport [{r.ref}] <span className="font-medium">{r.passport.title}</span>
                  {r.trust.criteria.some((c) => c.id === 'owner_review' && c.status !== 'ok') && '. It needs a review.'}
                </span>
                <button onClick={() => onOpenPassport(r.passportId)} className="whitespace-nowrap font-medium underline">
                  Review →
                </button>
              </div>
            ))}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-500">Answer</h2>
                <TrustBadge level={result.confidence} prefix="Confidence:" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {result.answer ? (
                  <AnswerText text={result.answer} items={allItems} onOpenPassport={onOpenPassport} />
                ) : (
                  'No answer found in active passports.'
                )}
              </p>

              {result.uncertainty.length > 0 && (
                <div className="mt-4 rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-500">What we are not sure about</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-slate-600">
                    {result.uncertainty.map((u) => <li key={u}>{u}</li>)}
                  </ul>
                </div>
              )}

              {result.whoToContact && (
                <p className="mt-3 text-sm text-slate-600">
                  Who to contact: <span className="font-medium">{result.whoToContact.name}</span>
                  {result.whoToContact.unit && ` (${result.whoToContact.unit})`}
                </p>
              )}
            </div>

            {result.conflicts.map((conflict) => (
              <button
                key={conflict.id}
                onClick={() => onOpenConflict(conflict, allItems)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900 shadow-sm transition hover:border-amber-300"
              >
                <span>⚠ Sources disagree: {conflict.positions.map((p) => p.claim).join(' vs ')}</span>
                <span className="whitespace-nowrap font-medium underline">Compare →</span>
              </button>
            ))}

            <div>
              <h2 className="text-sm font-semibold text-slate-500">Passports found</h2>
              <div className="mt-2 space-y-3">
                {result.results.map((r) => (
                  <ResultCard key={r.passportId} result={r} isMine={r.canEdit} onOpenPassport={onOpenPassport} />
                ))}
              </div>
            </div>

            {result.archived.length > 0 && (
              <div>
                <button
                  onClick={() => setShowArchived((v) => !v)}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800"
                  aria-expanded={showArchived}
                >
                  {showArchived ? '▾' : '▸'} Archive ({result.archived.length}): matched, but no longer relevant
                </button>
                {showArchived && (
                  <div className="mt-2 space-y-3">
                    {result.archived.map((r) => (
                      <ResultCard key={r.passportId} result={r} isMine={false} onOpenPassport={onOpenPassport} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
