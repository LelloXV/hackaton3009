import TrustBadge from './TrustBadge'
import { evaluateTrust } from '../trust'

export default function SourceCard({ source, context, onOpenPassport }) {
  const { passport } = source
  const trust = evaluateTrust(passport, context)

  return (
    <button
      onClick={() => onOpenPassport(passport.id)}
      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-slate-400">[{source.ref}]</span>
          <h3 className="text-sm font-semibold text-slate-800">{passport.title}</h3>
        </div>
        <TrustBadge level={trust.level} score={trust.score} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{trust.summary}</p>
      <ul className="mt-2 space-y-1">
        {trust.checks.map((check) => (
          <li key={check.id} className={`flex items-start gap-1.5 text-xs ${check.ok ? 'text-slate-600' : 'text-rose-600'}`}>
            <span>{check.ok ? '✓' : '✗'}</span>
            <span>{check.text}</span>
          </li>
        ))}
      </ul>
    </button>
  )
}
