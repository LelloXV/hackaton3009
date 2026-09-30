// Small tile showing which tool a source lives in.
const APPS = {
  SharePoint: { short: 'SP', className: 'bg-teal-100 text-teal-800' },
  'Microsoft Teams': { short: 'T', className: 'bg-indigo-100 text-indigo-800' },
  Excel: { short: 'X', className: 'bg-green-100 text-green-800' },
  Confluence: { short: 'C', className: 'bg-blue-100 text-blue-800' },
  Outlook: { short: 'O', className: 'bg-sky-100 text-sky-800' },
  OneNote: { short: 'N', className: 'bg-purple-100 text-purple-800' },
}

export default function AppIcon({ app }) {
  const a = APPS[app] ?? { short: '•', className: 'bg-slate-100 text-slate-600' }
  return (
    <span
      aria-hidden="true"
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${a.className}`}
    >
      {a.short}
    </span>
  )
}
