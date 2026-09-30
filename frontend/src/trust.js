// Display helpers only. Scores, levels and criteria come from the backend.

// Criterion status -> how it looks. Never color alone: icon + word + color.
export const STATUS_STYLES = {
  ok: { label: 'OK', icon: '✓', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  partial: { label: 'Partial', icon: '!', text: 'text-amber-700', bg: 'bg-amber-50' },
  stale: { label: 'Stale', icon: '!', text: 'text-amber-700', bg: 'bg-amber-50' },
  missing: { label: 'Missing', icon: '✕', text: 'text-rose-700', bg: 'bg-rose-50' },
  conflict: { label: 'Conflict', icon: '✕', text: 'text-rose-700', bg: 'bg-rose-50' },
}

export const LEVEL_STYLES = {
  high: { label: 'High', icon: '✓', text: 'text-emerald-700', bar: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  medium: { label: 'Medium', icon: '!', text: 'text-amber-600', bar: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  low: { label: 'Low', icon: '✕', text: 'text-rose-600', bar: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 ring-rose-200' },
  none: { label: 'None', icon: '–', text: 'text-slate-500', bar: 'bg-slate-400', chip: 'bg-slate-100 text-slate-600 ring-slate-200' },
}

export const RELATION_LABELS = {
  supports: 'Supports',
  contradicts: 'Contradicts',
  derived_from: 'Derived from',
  supersedes: 'Replaces',
}

export const STAMP_LABELS = {
  verified: { label: 'Verified', icon: '✓', text: 'text-emerald-700' },
  conflict: { label: 'Conflict', icon: '✕', text: 'text-rose-700' },
  conflict_resolved: { label: 'Conflict resolved', icon: '✓', text: 'text-emerald-700' },
  revoked: { label: 'Revoked', icon: '✕', text: 'text-rose-700' },
  note: { label: 'Note', icon: 'i', text: 'text-slate-600' },
}

// Status to show first in "What to consider": problems before OK.
const STATUS_ORDER = ['conflict', 'missing', 'stale', 'partial', 'ok']
export function byStatus(a, b) {
  return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
}

export function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// "BE, NL, FR, DE, ES +12 more"
export function shortList(values, max = 5) {
  if (values.length <= max) return values.join(', ')
  return `${values.slice(0, max).join(', ')} +${values.length - max} more`
}

export function scopeValues(scope, all = 'All') {
  if (scope.mode === 'all') return all
  if (scope.mode === 'unknown') return null
  return scope.values
}
