import { useEffect, useState } from 'react'
import { askQuestion, getClientName } from '../api'
import SourceCard from '../components/SourceCard'

const DEMO_QUESTION = 'How is holiday leave calculated in Belgium for a new hire at Client Atlas SA?'

export default function AnswerScreen({ currentUser, onOpenPassport, onOpenConflict, onLogout }) {
  const [question, setQuestion] = useState(DEMO_QUESTION)
  const [result, setResult] = useState(null)

  useEffect(() => {
    askQuestion(DEMO_QUESTION).then(setResult)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    askQuestion(question).then(setResult)
  }

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

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Ask a question about a client…"
          />
        </form>

        {result && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm leading-relaxed text-slate-700">{result.answer}</p>
              {result.uncertainty && (
                <p className="mt-3 text-sm text-slate-500">Not sure yet: {result.uncertainty}</p>
              )}
            </div>

            {result.conflicts.map((conflict) => (
              <button
                key={conflict.id}
                onClick={() => onOpenConflict(conflict)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800 shadow-sm transition hover:border-amber-300"
              >
                <span>
                  ⚠ Sources [{conflict.sourceA.ref}] and [{conflict.sourceB.ref}] disagree: {conflict.title}
                </span>
                <span className="whitespace-nowrap font-medium underline">Compare →</span>
              </button>
            ))}

            <div>
              <h2 className="text-sm font-semibold text-slate-500">
                Sources · {result.context.country} · {getClientName(result.context.client)}
              </h2>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {result.sources.map((source) => (
                  <SourceCard
                    key={source.ref}
                    source={source}
                    context={result.context}
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
