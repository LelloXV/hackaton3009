import { useEffect, useState } from 'react'
<<<<<<< HEAD
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { getUsers } from '../api'
import { auth, firebaseEnabled } from '../firebase'

const ERRORS = {
  'auth/invalid-credential': 'Wrong email or password.',
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-not-found': 'Wrong email or password.',
  'auth/wrong-password': 'Wrong email or password.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
  'auth/popup-blocked': 'The browser blocked the Google popup. Allow popups and try again.',
  'auth/network-request-failed': 'Network error. Check your connection.',
}

function friendlyError(err) {
  return ERRORS[err?.code] ?? 'Something went wrong. Please try again.'
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [demoUsers, setDemoUsers] = useState([])

  useEffect(() => {
    if (!firebaseEnabled) getUsers().then(setDemoUsers)
  }, [])

  const isSignup = mode === 'signup'

  // With Firebase, App picks up the signed-in user via onAuthStateChanged.
  async function run(action) {
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await action()
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(friendlyError(err))
      }
    } finally {
      setBusy(false)
    }
  }

  function handleGoogle() {
    run(() => signInWithPopup(auth, new GoogleAuthProvider()))
  }

  function handleSubmit(e) {
    e.preventDefault()
    run(async () => {
      if (isSignup) {
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)
        if (name.trim()) {
          await updateProfile(user, { displayName: name.trim() })
          await user.reload()
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      }
    })
  }

  function handleReset() {
    if (!email.trim()) {
      setError('Enter your email first, then click "Forgot password?".')
      return
    }
    run(async () => {
      await sendPasswordResetEmail(auth, email.trim())
      setInfo('If an account exists for this email, a reset link is on its way.')
    })
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-slate-800'

=======
import { getUsers, signIn, useMock } from '../api'

export default function Login({ onLogin }) {
  const [users, setUsers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getUsers().then((list) => {
      setUsers(list)
      setSelectedId(list[0]?.id ?? null)
    })
  }, [])

  async function handleSignIn() {
    setLoading(true)
    setError(null)
    try {
      onLogin(await signIn(users.find((u) => u.id === selectedId)))
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

>>>>>>> origin/backend
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-800">Knowledge Passport</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isSignup ? 'Create an account to get started.' : 'Sign in to your account.'}
        </p>

<<<<<<< HEAD
        {firebaseEnabled ? (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
=======
        <div className="mt-6 space-y-2">
          {users.map((u) => (
            <label
              key={u.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                selectedId === u.id ? 'border-slate-800 bg-slate-50' : 'border-slate-200'
              }`}
>>>>>>> origin/backend
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignup && (
                <label className="block text-sm text-slate-600">
                  Name
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                  />
                </label>
              )}
              <label className="block text-sm text-slate-600">
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm text-slate-600">
                <span className="flex items-center justify-between">
                  Password
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Forgot password?
                    </button>
                  )}
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </label>

              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
              {info && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{info}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-500">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(isSignup ? 'signin' : 'signup')
                  setError('')
                  setInfo('')
                }}
                className="font-medium text-slate-800 hover:underline"
              >
                {isSignup ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </>
        ) : (
          <div className="mt-6 space-y-2">
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Firebase is not configured (see frontend/.env.example). Using demo accounts.
            </p>
            {demoUsers.map((u) => (
              <button
                key={u.uid}
                type="button"
                onClick={() => onLogin(u)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm transition hover:border-slate-800"
              >
                <span className="font-medium text-slate-800">{u.name}</span>
                <span className="block text-xs text-slate-500">{u.description}</span>
<<<<<<< HEAD
              </button>
            ))}
          </div>
        )}
=======
              </span>
              <input
                type="radio"
                name="user"
                checked={selectedId === u.id}
                onChange={() => setSelectedId(u.id)}
                className="accent-slate-800"
              />
            </label>
          ))}
        </div>

        <button
          onClick={handleSignIn}
          disabled={!selectedId || loading}
          className="mt-6 w-full rounded-lg bg-slate-800 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <p className="mt-4 text-center text-xs text-slate-400">
          {useMock ? 'Demo mode: example data, no backend.' : 'Connected to the Firebase backend.'}
        </p>
>>>>>>> origin/backend
      </div>
    </div>
  )
}
