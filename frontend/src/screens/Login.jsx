import { useEffect, useState } from 'react'
import { getUsers } from '../api'

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    getUsers().then((list) => {
      setUsers(list)
      setSelectedId(list[0]?.uid ?? null)
    })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">Knowledge Passport</h1>
        <p className="mt-1 text-sm text-slate-500">Choose a demo account to sign in.</p>

        <div className="mt-6 space-y-2">
          {users.map((u) => (
            <label
              key={u.uid}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                selectedId === u.uid ? 'border-slate-800 bg-slate-50' : 'border-slate-200'
              }`}
            >
              <span>
                <span className="font-medium text-slate-800">{u.name}</span>
                <span className="block text-xs text-slate-500">{u.description}</span>
              </span>
              <input
                type="radio"
                name="user"
                checked={selectedId === u.uid}
                onChange={() => setSelectedId(u.uid)}
                className="accent-slate-800"
              />
            </label>
          ))}
        </div>

        <button
          onClick={() => onLogin(users.find((u) => u.uid === selectedId))}
          disabled={!selectedId}
          className="mt-6 w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}
