// Display helpers only. The trust score, the reasons, the conflicts and the
// overall confidence all come from the backend (service/functions/src/scoring.ts).

// TEMPORARY: the backend returns a score per source but no High/Medium/Low label
// (it only labels the overall answer, as `confidence`). Until it adds one, the
// badge uses the same thresholds the backend uses for `confidence` (75 / 50).
// When ScoredSource gets a `level` field, this falls back automatically.
export function sourceLevel(source) {
  if (source.level) return source.level
  if (source.score >= 75) return 'high'
  if (source.score >= 50) return 'medium'
  return 'low'
}

// Backend reasons are strings starting with "+ " (good) or "− " (a concern).
export function parseReason(reason) {
  const ok = reason.startsWith('+')
  return { ok, text: reason.replace(/^[+−-]\s*/, '') }
}

export const VERIFICATION_LABELS = {
  verified: 'Verified',
  expired: 'Verification expired',
  changed_since_verification: 'Changed since last verification',
  unverified: 'Never verified',
}

export const SOURCE_TYPE_LABELS = {
  policy: 'Policy',
  procedure: 'Procedure',
  email: 'Email',
  teams_chat: 'Teams chat',
}

// Maximum points per factor, as in WEIGHTS in scoring.ts (used to draw the breakdown).
export const BREAKDOWN_MAX = { relevance: 30, verification: 25, owner: 15, sourceType: 15, agreement: 15 }

export const BREAKDOWN_LABELS = {
  relevance: 'Relevance',
  verification: 'Verification',
  owner: 'Owner',
  sourceType: 'Source type',
  agreement: 'Agreement',
}

export function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
