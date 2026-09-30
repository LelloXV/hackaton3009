import { useEffect, useState } from 'react'
import { askQuestion } from '../api'
import { demoQuestion } from '../data/mockData'
import SourceCard from '../components/SourceCard'
import TrustBadge from '../components/TrustBadge'

const COUNTRIES = ['BE', 'NL']

export default function AnswerScreen({ currentUser, refreshKey, onOpenPassport, onOpenConflict, onLogout }) {
  const [question, setQuestion] = useState(demoQuestion.question)
  const [country, setCountry] = useState(demoQuestion.country)
  const [askedQuestion, setAskedQuestion] = useState(demoQuestion.question)
  const [result, setResult] = useState(null)

  // Ask again when the question is submitted, the country changes, or a source
  // was verified (refreshKey).
  useEffect(() => {
    askQuestion(askedQuestion, { country }).then(setResult)
  }, [askedQuestion, country, refreshKey])

  function handleSubmit(e) {
    e.preventDefault()
    setAskedQuestion(question)
  }

  // Citation numbers follow the order of `sources`, which the backend already sorted.
  const refOf = (passportId) => result.sources.findIndex((s) => s.passportId === passportId) + 1
  const isMine = (source) => source.owner?.contact.toLowerCase() === currentUser.email.toLowerCase()
  const mySources = result ? result.sources.filter(isMine) : []

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Knowledge Passport</h1>
            <p className="text-sm text-slate-500">
              {currentUser.name} · <span className="capitalize">{currentUser.role}</span>
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
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Country"
            className="rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm"
          >
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button type="submit" className="rounded-xl bg-slate-800 px-4 text-sm font-medium text-white hover:bg-slate-700">
            Ask
          </button>
        </form>

        {result && (
          <div className="mt-6 space-y-6">
            {mySources.map((source) => (
              <div
                key={source.passportId}
                className="flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
              >
                <span>
                  You own source [{refOf(source.passportId)}] <span className="font-medium">{source.title}</span>.
                  {source.verificationStatus !== 'verified' && ' It needs your review.'}
                </span>
                <button
                  onClick={() => onOpenPassport(source.passportId)}
                  className="whitespace-nowrap font-medium underline"
                >
                  Review →
                </button>
              </div>
            ))}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-500">Answer</h2>
                <TrustBadge level={result.confidence} prefix="Confidence:" />
              </div>
              {result.answer ? (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {result.answer} <span className="font-semibold text-slate-500">[{refOf(result.topSourceId)}]</span>
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No answer found in the sources.</p>
              )}

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
                  Who to contact: <span className="font-medium">{result.whoToContact.name}</span> ({result.whoToContact.team})
                </p>
              )}
            </div>

            {result.conflicts.map((conflict) => (
              <button
                key={conflict.topic}
                onClick={() => onOpenConflict(conflict, result.sources)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800 shadow-sm transition hover:border-amber-300"
              >
                <span>
                  ⚠ Sources disagree:{' '}
                  {conflict.positions
                    .map((p) => `${p.claim} [${p.passportIds.map(refOf).join('][')}]`)
                    .join(' vs ')}
                </span>
                <span className="whitespace-nowrap font-medium underline">Compare →</span>
              </button>
            ))}

            <div>
              <h2 className="text-sm font-semibold text-slate-500">Sources</h2>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {result.sources.map((source, i) => (
                  <SourceCard
                    key={source.passportId}
                    source={source}
                    refNumber={i + 1}
                    isMine={isMine(source)}
                    onOpenPassport={onOpenPassport}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
