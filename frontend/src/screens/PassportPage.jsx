import { useEffect, useState } from 'react'
import { confirmStillValid, getPassport } from '../api'
import AppIcon from '../components/AppIcon'
import AskAI from '../components/AskAI'
import Icon from '../components/Icon'
import StatusPill from '../components/StatusPill'
import {
  LEVEL_STYLES,
  RELATION_LABELS,
  STAMP_LABELS,
  byStatus,
  formatDate,
  scopeValues,
  shortList,
} from '../trust'

const TABS = ['overview', 'sources', 'stamps', 'updates', 'related']
const KEY_SOURCES = 4

export default function PassportPage({ passportId, onOpenPassport, onVerified, onClose }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [error, setError] = useState(null)
  const [justConfirmed, setJustConfirmed] = useState(false)

  useEffect(() => {
    getPassport(passportId).then(setData)
  }, [passportId])

  if (!data) return null
  const { passport, trust, archived, canEdit } = data

  async function handleConfirm() {
    setError(null)
    try {
      setData(await confirmStillValid(passport.id))
      setJustConfirmed(true)
      onVerified()
    } catch (err) {
      setError(err.message)
    }
  }

  function showVersion(version) {
    setSelectedVersion(version)
    setTab('updates')
  }

  function goBack() {
    window.scrollTo(0, 0)
    onClose()
  }

  const tabLabel = { overview: `Passport ${passport.reference}`, sources: 'Sources', stamps: 'Stamps', updates: 'Updates', related: 'Related' }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <button onClick={goBack} className="text-sm text-slate-500 hover:text-slate-800">← Back to results</button>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <nav className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-6">
            <div className="flex flex-wrap gap-6">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`border-b-2 py-4 text-sm font-medium ${
                    tab === t ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tabLabel[t]}
                </button>
              ))}
            </div>
            <select
              value={selectedVersion ?? passport.version}
              onChange={(e) => showVersion(Number(e.target.value))}
              aria-label="Version"
              className="my-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium"
            >
              {[...passport.updates].reverse().map((u) => (
                <option key={u.version} value={u.version}>
                  v{u.version}{u.version === passport.version ? ' (current)' : ''}
                </option>
              ))}
            </select>
          </nav>

          <div className="p-6">
            {tab === 'overview' && (
              <Overview
                passport={passport}
                trust={trust}
                archived={archived}
                canConfirm={canEdit && !archived}
                justConfirmed={justConfirmed}
                error={error}
                onConfirm={handleConfirm}
                onViewAllSources={() => setTab('sources')}
              />
            )}
            {tab === 'sources' && <SourceList sources={passport.linkedSources} />}
            {tab === 'stamps' && <Stamps passport={passport} />}
            {tab === 'updates' && <Updates passport={passport} selectedVersion={selectedVersion} />}
            {tab === 'related' && <Related related={passport.related} onOpenPassport={onOpenPassport} />}
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">Demo · fictional projects and people</p>
      </div>
    </div>
  )
}

function Overview({ passport, trust, archived, canConfirm, justConfirmed, error, onConfirm, onViewAllSources }) {
  const [showAllDepartments, setShowAllDepartments] = useState(false)
  const countries = scopeValues(passport.visa.countries)
  const [firstDepartment, ...moreDepartments] = passport.departments

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{passport.title}</h1>
        <p className="mt-2 text-slate-600">{passport.description}</p>

        {archived && (
          <p className="mt-4 rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-700">
            <span aria-hidden="true">▣</span> <span className="font-semibold">Archived.</span> This passport is no longer relevant since{' '}
            {formatDate(passport.expiresAt)}. It is kept for reference and is not used to answer questions.
          </p>
        )}

        <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
          <InfoRow icon="building" label="Department">
            <div className="flex items-start justify-between gap-2">
              <span>{showAllDepartments ? passport.departments.join(', ') : firstDepartment}</span>
              {moreDepartments.length > 0 && (
                <button
                  onClick={() => setShowAllDepartments((v) => !v)}
                  className="whitespace-nowrap rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200"
                >
                  {showAllDepartments ? 'Show less' : `+${moreDepartments.length} more`}
                </button>
              )}
            </div>
          </InfoRow>
          <InfoRow
            icon="users"
            label="Owner (unit)"
            sub={passport.owner?.type === 'team' ? 'Responsible for accuracy and updates · any member can update it' : 'Responsible for accuracy and updates'}
          >
            {passport.owner?.name ?? <span className="text-rose-600">No owner</span>}
          </InfoRow>
          <InfoRow icon="calendar" label="Last updated" sub={passport.updatedBy && `By ${passport.updatedBy.name}`}>
            {formatDate(passport.updatedAt)}
          </InfoRow>
          <InfoRow icon="globe" label="Applies to">
            <span title={Array.isArray(countries) ? countries.join(', ') : undefined}>
              {countries === null ? <span className="text-rose-600">Unknown</span> : Array.isArray(countries) ? shortList(countries) : 'All countries'}
            </span>
          </InfoRow>
          <InfoRow icon="hourglass" label="Relevant until" sub={passport.lastVerifiedAt ? `Last verified ${formatDate(passport.lastVerifiedAt)}` : 'Current version not verified yet'}>
            {passport.expiresAt ? (
              <span>{formatDate(passport.expiresAt)}{archived && ' (archived)'}</span>
            ) : (
              'No end date'
            )}
          </InfoRow>
        </dl>

        <section className="mt-6 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-slate-800">
              <Icon name="layers" className="h-5 w-5 text-sky-600" /> Key sources
            </h2>
            <button onClick={onViewAllSources} className="text-sm font-medium text-sky-700 hover:underline">
              View all ({passport.linkedSources.length}) →
            </button>
          </div>
          <p className="text-sm text-slate-500">Original documents, discussions and data used for this passport.</p>
          <SourceList sources={passport.linkedSources.slice(0, KEY_SOURCES)} compact />
        </section>
      </div>

      <div className="min-w-0 space-y-4">
        <ScoreCard trust={trust} archived={archived} />

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800">What to consider?</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-2 py-2 font-medium">Criteria</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...trust.criteria].sort(byStatus).map((c) => (
                  <tr key={c.id}>
                    <td className="px-2 py-2 text-slate-700">{c.label}</td>
                    <td className="px-2 py-2"><StatusPill status={c.status} /></td>
                    <td className="px-2 py-2 text-slate-600">{c.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {justConfirmed ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            ✓ Confirmed. Owner review is now up to date; open conflicts still need to be resolved.
          </p>
        ) : canConfirm ? (
          <button onClick={onConfirm} className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500">
            Confirm still valid
          </button>
        ) : (
          <p className="text-xs text-slate-400">
            {archived
              ? 'Archived passports cannot be confirmed.'
              : passport.owner?.type === 'team'
                ? `Any member of ${passport.owner.name} can confirm this passport is still valid.`
                : `Only ${passport.owner?.name ?? 'the owner'} can confirm this passport is still valid.`}
          </p>
        )}
        {error && <p className="text-xs text-rose-600">{error}</p>}

        <AskAI key={passport.id} passport={passport} />
      </div>
    </div>
  )
}

function InfoRow({ icon, label, sub, children }) {
  return (
    <div className="grid grid-cols-[1.5rem_7.5rem_1fr] items-start gap-3 px-4 py-3 text-sm">
      <Icon name={icon} className="h-5 w-5 text-sky-600" />
      <dt className="font-medium text-slate-800">{label}</dt>
      <dd className="text-slate-700">
        {children}
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </dd>
    </div>
  )
}

function ScoreCard({ trust, archived }) {
  const [showHelp, setShowHelp] = useState(false)
  // An archived passport keeps its score for reference, shown in grey.
  const level = archived ? { ...LEVEL_STYLES.none, icon: '▣', label: 'Archived' } : LEVEL_STYLES[trust.level] ?? LEVEL_STYLES.none

  return (
    <section className="relative rounded-xl border border-slate-200 p-4">
      <h2 className="flex items-center gap-2 font-semibold text-slate-800">
        Confidence score
        <button onClick={() => setShowHelp((v) => !v)} aria-label="How is the score calculated?" className="text-sky-600 hover:text-sky-800">
          <Icon name="info" className="h-5 w-5" />
        </button>
      </h2>
      <p className="mt-1 flex items-baseline gap-3">
        <span className={`text-5xl font-bold ${level.text}`}>{trust.score}%</span>
        <span className={`text-sm font-medium ${level.text}`}>{level.icon} {level.label}</span>
      </p>
      <div className="mt-3 h-2.5 rounded-full bg-slate-100" role="progressbar" aria-valuenow={trust.score} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-2.5 rounded-full ${level.bar}`} style={{ width: `${trust.score}%` }} />
      </div>

      {showHelp && (
        <div className="absolute right-0 top-12 z-10 w-72 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-lg">
          <div className="flex items-start justify-between">
            <p className="font-semibold text-slate-800">How is the score calculated?</p>
            <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-700">✕</button>
          </div>
          <p className="mt-1 text-slate-600">We check {trust.criteria.length} criteria (100 points total):</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-600">
            {[...trust.criteria].sort((a, b) => b.maxPoints - a.maxPoints).map((c) => (
              <li key={c.id}>
                {c.label} ({c.maxPoints}) · <span className="text-slate-500">here {c.points}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function SourceList({ sources, compact }) {
  return (
    <ul className={`space-y-2 ${compact ? 'mt-3' : ''}`}>
      {sources.map((s) => (
        <li key={s.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <AppIcon app={s.app} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{s.title}</p>
            <p className="text-xs text-slate-500">
              {[s.app, s.version, formatDate(s.updatedAt)].filter(Boolean).join(' · ')}
              {!compact && (
                <span className={s.relation === 'contradicts' ? 'text-rose-600' : ''}> · {RELATION_LABELS[s.relation]}</span>
              )}
            </p>
          </div>
          {compact && s.relation === 'contradicts' && <span className="text-xs font-medium text-rose-600">✕ Contradicts</span>}
          <a href={s.uri} target="_blank" rel="noreferrer" aria-label={`Open ${s.title}`} className="text-sky-600 hover:text-sky-800">
            <Icon name="external" className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  )
}

function Stamps({ passport }) {
  const stamps = [...passport.stamps].sort((a, b) => new Date(b.at) - new Date(a.at))
  return (
    <ol className="space-y-3 border-l border-slate-200 pl-5">
      {stamps.map((s) => {
        const style = STAMP_LABELS[s.type]
        return (
          <li key={s.id} className="text-sm">
            <p className={`font-medium ${style.text}`}>
              <span aria-hidden="true">{style.icon}</span> {style.label}
              <span className="font-normal text-slate-400"> · v{s.version} · {formatDate(s.at)} · {s.actor.name}</span>
            </p>
            <p className="text-slate-600">{s.note}</p>
          </li>
        )
      })}
    </ol>
  )
}

function Updates({ passport, selectedVersion }) {
  const updates = [...passport.updates].reverse()
  return (
    <ol className="space-y-3">
      {updates.map((u, i) => (
        <li
          key={u.version}
          className={`rounded-lg border p-3 text-sm ${u.version === selectedVersion ? 'border-sky-300 bg-sky-50' : 'border-slate-200'}`}
        >
          <p className="font-medium text-slate-800">
            v{u.version}
            {u.version === passport.version && <span className="ml-2 text-xs text-emerald-700">current</span>}
            <span className="font-normal text-slate-400"> · {formatDate(u.at)} · {u.actor.name}</span>
          </p>
          <p className="mt-1 text-slate-600">
            {i < updates.length - 1 ? `What changed since v${updates[i + 1].version}: ` : ''}
            {u.summary}
          </p>
        </li>
      ))}
    </ol>
  )
}

function Related({ related, onOpenPassport }) {
  if (related.length === 0) return <p className="text-sm text-slate-500">No related passports.</p>
  return (
    <ul className="space-y-2">
      {related.map((r) => (
        <li key={r.passportId}>
          <button
            onClick={() => onOpenPassport(r.passportId)}
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-left text-sm hover:border-slate-300"
          >
            <span className="font-medium text-slate-800">{r.title}</span>
            <span className="ml-2 text-slate-500">· {r.relation}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
