import { useState } from 'react'
import { askPassportAI } from '../api'

// Chat about one passport. Answers are based only on the passport's sources.
export default function AskAI({ passport }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const question = draft.trim()
    if (!question || loading) return
    setDraft('')
    setMessages((m) => [...m, { role: 'user', text: question }])
    setLoading(true)
    try {
      const reply = await askPassportAI(passport.id, question)
      setMessages((m) => [...m, { role: 'ai', text: reply.answer, citations: reply.citations }])
    } catch {
      setMessages((m) => [...m, { role: 'ai', text: 'Something went wrong. Please try again.', citations: [] }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
      <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
        <span aria-hidden="true" className="text-sky-600">✦</span> Ask AI about this passport
      </h3>
      <p className="mt-0.5 text-sm text-slate-500">Get answers based on the sources and context of this project.</p>

      {messages.length > 0 && (
        <ol className="mt-4 max-h-72 space-y-3 overflow-y-auto">
          {messages.map((m, i) => (
            <li key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
              <div
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
                  m.role === 'user' ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-white text-slate-700'
                }`}
              >
                {m.text}
                {m.citations?.length > 0 && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Sources: {m.citations.map((c) => c.title).join(', ')}
                  </p>
                )}
              </div>
            </li>
          ))}
          {loading && <li className="text-sm text-slate-400">Reading the sources…</li>}
        </ol>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question about this project…"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Send"
          className="rounded-xl bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          ➤
        </button>
      </form>
      <p className="mt-2 text-[11px] text-slate-400">AI answers can be wrong. Always check the cited sources.</p>
    </section>
  )
}
