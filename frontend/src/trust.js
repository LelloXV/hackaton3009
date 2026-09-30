// Trust signals derived from a passport, following docs/passport-contract.md.
// Six independent checks, each with a plain-language reason. The score is only a
// quick summary of how many checks passed; the reasons are the real explanation.
//
//   score = checks passed / 6 * 100   (capped at BLOCKER_CAP for deal-breakers)
//   level = High at 100, Medium from MEDIUM_FROM, Low below
//
// Team decision: expiresAt is not used. Freshness is based on how long ago a
// person last verified the current version (FRESH_MONTHS).

import { getClientName } from './api'

const FRESH_MONTHS = 12
const MEDIUM_FROM = 50 // score 50-99 = Medium, below 50 = Low, 100 = High
const BLOCKER_CAP = 30 // max score for a withdrawn or out-of-scope source

const COUNTRY_NAMES = { BE: 'Belgium', NL: 'Netherlands', FR: 'France', DE: 'Germany', LU: 'Luxembourg' }
const MODULE_NAMES = { hr: 'HR', pay: 'Pay', time: 'Time' }

export function countryName(code) {
  return COUNTRY_NAMES[code] ?? code
}

export function moduleName(code) {
  return MODULE_NAMES[code] ?? code
}

export function timeAgo(iso, now = new Date()) {
  const days = Math.floor((now - new Date(iso)) / 86_400_000)
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 31) return `${days} days ago`
  const months = Math.floor(days / 30.4)
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`
  const years = Math.floor(months / 12)
  return years === 1 ? 'over a year ago' : `over ${years} years ago`
}

export function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function currentStamps(passport, type) {
  return passport.stamps.filter((s) => s.version === passport.version && s.type === type)
}

// Contract rule: all -> match, listed -> match only on membership, unknown -> indeterminate.
function scopeCheck(passport, context) {
  const dimensions = [
    { key: 'countries', value: context.country, label: 'country', name: countryName },
    { key: 'clients', value: context.client, label: 'client', name: getClientName },
    { key: 'modules', value: context.module, label: 'module', name: moduleName },
  ]
  const unknown = []
  for (const d of dimensions) {
    const scope = passport.visa[d.key]
    if (!d.value || scope.mode === 'unknown') {
      unknown.push(d.label)
    } else if (scope.mode === 'listed' && !scope.values.includes(d.value)) {
      return {
        signal: 'out_of_scope',
        ok: false,
        text: `Applies to ${scope.values.map(d.name).join(', ')}, not ${d.name(d.value)}`,
      }
    }
  }
  if (unknown.length > 0) {
    return { signal: 'unknown', ok: false, text: `Scope not confirmed (${unknown.join(', ')})` }
  }
  return {
    signal: 'in_scope',
    ok: true,
    text: `Applies to ${countryName(context.country)} · ${getClientName(context.client)}`,
  }
}

export function evaluateTrust(passport, context, now = new Date()) {
  const verified = currentStamps(passport, 'verified').filter((s) => s.actor.type === 'person')
  const conflicts = currentStamps(passport, 'conflict')
  const resolvedIds = new Set(currentStamps(passport, 'conflict_resolved').flatMap((s) => s.relatedStampIds))
  const openConflicts = conflicts.filter((c) => !resolvedIds.has(c.id))
  const revoked = currentStamps(passport, 'revoked')

  const monthsSinceCheck = passport.lastVerifiedAt
    ? (now - new Date(passport.lastVerifiedAt)) / (86_400_000 * 30.4)
    : null

  const checks = [
    { id: 'applicability', ...scopeCheck(passport, context) },
    passport.owner
      ? { id: 'ownership', signal: 'assigned', ok: true, text: `Owner: ${passport.owner.name}` }
      : { id: 'ownership', signal: 'unassigned', ok: false, text: 'No owner' },
    verified.length > 0
      ? { id: 'verification', signal: 'verified', ok: true, text: `Current version verified by ${verified.at(-1).actor.name}` }
      : { id: 'verification', signal: 'unverified', ok: false, text: 'Current version not verified by a person' },
    monthsSinceCheck === null
      ? { id: 'freshness', signal: 'unknown', ok: false, text: 'Never checked' }
      : monthsSinceCheck <= FRESH_MONTHS
        ? { id: 'freshness', signal: 'current', ok: true, text: `Checked ${timeAgo(passport.lastVerifiedAt, now)}` }
        : { id: 'freshness', signal: 'stale', ok: false, text: `Last checked ${timeAgo(passport.lastVerifiedAt, now)}` },
    openConflicts.length > 0
      ? { id: 'conflict', signal: 'unresolved', ok: false, text: 'Contradicts another source' }
      : { id: 'conflict', signal: 'clear', ok: true, text: 'No known conflicts' },
    revoked.length > 0
      ? { id: 'revocation', signal: 'revoked', ok: false, text: 'Withdrawn by owner' }
      : { id: 'revocation', signal: 'active', ok: true, text: 'Not withdrawn' },
  ]

  // Score: every check is worth the same, so score = passed / 6 * 100.
  // Deal-breakers (withdrawn, or written for another country/client/module) make a
  // source unusable for this question however good it is, so they cap the score.
  const passed = checks.filter((c) => c.ok).length
  let score = Math.round((passed / checks.length) * 100)
  const byId = Object.fromEntries(checks.map((c) => [c.id, c]))

  let cappedBecause = null
  if (byId.revocation.signal === 'revoked') cappedBecause = 'withdrawn by owner'
  else if (byId.applicability.signal === 'out_of_scope') cappedBecause = 'applies to another country or client'
  if (cappedBecause) score = Math.min(score, BLOCKER_CAP)

  // The level comes only from the score, so the word and the number always agree.
  // High needs every check to pass (contract: "positive overall badge").
  const level = score === 100 ? 'high' : score >= MEDIUM_FROM ? 'medium' : 'low'

  let summary = `${passed} of ${checks.length} checks passed`
  if (cappedBecause) summary += ` · capped at ${BLOCKER_CAP}: ${cappedBecause}`

  return { level, score, passed, total: checks.length, summary, checks }
}
