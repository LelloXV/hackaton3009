import { useState } from 'react'
import { users } from '../data/mockData'

export default function Login({ onLogin }) {
  const [selected, setSelected] = useState(users[0].id)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">Handover Copilot</h1>
        <p className="mt-1 text-sm text-slate-500">Accedi per vedere solo i clienti che ti competono.</p>

        <div className="mt-6 space-y-2">
          {users
            .filter((u) => u.role === 'consultant' || u.role === 'owner')
            .map((u) => (
              <label
                key={u.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                  selected === u.id ? 'border-slate-800 bg-slate-50' : 'border-slate-200'
                }`}
              >
                <span>
                  <span className="font-medium text-slate-800">{u.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{u.role}</span>
                </span>
                <input
                  type="radio"
                  name="user"
                  checked={selected === u.id}
                  onChange={() => setSelected(u.id)}
                  className="accent-slate-800"
                />
              </label>
            ))}
        </div>

        <button
          onClick={() => onLogin(selected)}
          className="mt-6 w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Entra
        </button>
      </div>
    </div>
  )
}
