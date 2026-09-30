import { useState } from 'react'
import { documents, exampleAnswer } from '../data/mockData'
import SourceCard from '../components/SourceCard'

export default function AnswerScreen({ currentUser, onOpenPassport, onOpenConflict, onLogout }) {
  const [question, setQuestion] = useState(exampleAnswer.domanda)
  const [submitted, setSubmitted] = useState(true)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Handover Copilot</h1>
            <p className="text-sm text-slate-500">
              {currentUser.name} · <span className="capitalize">{currentUser.role}</span> · Client Atlas SA
            </p>
          </div>
          <button onClick={onLogout} className="text-xs text-slate-400 hover:text-slate-700">Esci</button>
        </header>

        <form onSubmit={handleSubmit} className="mt-6">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
            placeholder="Fai una domanda sul cliente…"
          />
        </form>

        {submitted && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm leading-relaxed text-slate-700">{exampleAnswer.risposta}</p>
            </div>

            <button
              onClick={onOpenConflict}
              className="flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800 shadow-sm transition hover:border-amber-300"
            >
              <span>⚠ Le fonti [1] e [2] sono in conflitto. Il cliente potrebbe seguire una versione superata.</span>
              <span className="whitespace-nowrap font-medium underline">Vedi confronto →</span>
            </button>

            <div>
              <h2 className="text-sm font-semibold text-slate-500">Fonti</h2>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {exampleAnswer.fonti.map((fonte) => (
                  <SourceCard
                    key={fonte.ref}
                    fonte={fonte}
                    doc={documents.find((d) => d.doc_id === fonte.doc_id)}
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
