// Single place for all data access. Screens only import from here.
//
// Shapes are exactly the backend's (service/functions/src/types.ts, contract
// docs/passport-contract.md v1.1.0):
//   signIn(demoUser)                    -> user with name and teams (callable "whoAmI")
//   askQuestion(question, { country })  -> AskResult                (callable "ask")
//   getPassport(passportId)             -> PassportView             (callable "getPassport")
//   confirmStillValid(passportId)       -> PassportView             (callable "confirmStillValid")
//   askPassportAI(passportId, message)  -> { answer, citations }    (callable "askPassportAI")
//
// Demo mode (VITE_USE_MOCK not "false") uses ./data/generated, which the backend
// exports from its own code, so both modes return the same shapes.

import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { afterConfirm, before, demoUsers, meta, mockAiAnswers, teams } from './data/mockData'
import { auth, functions, useMock } from './firebase'

export { useMock }

// ---------- Real backend ----------

// Turn Firebase errors into short, safe messages for the screen.
function friendlyError(err) {
  const code = err?.code ?? ''
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) {
    return 'Sign-in failed: wrong email or password.'
  }
  if (code.includes('unauthenticated')) return 'Please sign in again.'
  if (code.includes('permission-denied')) return err.message || 'You are not allowed to do this.'
  if (code.includes('invalid-argument')) return 'Please check your input (questions need at least 5 characters).'
  if (code.includes('unavailable') || code.includes('network')) return 'The backend is not reachable. Is it running?'
  return err?.message || 'Something went wrong. Please try again.'
}

async function call(name, data) {
  try {
    const result = await httpsCallable(functions, name)(data)
    return result.data
  } catch (err) {
    throw new Error(friendlyError(err))
  }
}

// ---------- Demo mode ----------

// Has the demo passport been confirmed in this session?
let confirmed = false
const scenario = () => (confirmed ? afterConfirm : before)
let mockUser = null

// Same rule as the backend (service/functions/src/access.ts): any member of the
// owning team may update and confirm the passport.
function mockCanEdit(passport, user) {
  if (!passport.owner || !user) return false
  const email = user.email.toLowerCase()
  const team = teams.find((t) => t.id === passport.owner.id)
  if (team) return team.members.some((m) => m.email.toLowerCase() === email)
  return passport.owner.id === user.id
}

const withCanEdit = (view) => ({ ...view, canEdit: mockCanEdit(view.passport, mockUser) })

// ---------- API used by the screens ----------

export async function getUsers() {
  return demoUsers
}

// Signs in as one of the demo accounts. With the backend, this is a real Firebase
// sign-in (the backend checks the user on every call); the demo password comes from
// .env.local, never from the code.
export async function signIn(demoUser) {
  if (useMock) {
    mockUser = demoUser
    const myTeams = teams.filter((t) => t.members.some((m) => m.email === demoUser.email))
    return { ...demoUser, teams: myTeams.map((t) => ({ id: t.id, name: t.name })) }
  }
  const password = import.meta.env.VITE_DEMO_PASSWORD
  if (!password) throw new Error('VITE_DEMO_PASSWORD is missing in frontend/.env.local.')
  try {
    await signInWithEmailAndPassword(auth, demoUser.email, password)
  } catch (err) {
    throw new Error(friendlyError(err))
  }
  const me = await call('whoAmI', {})
  return { ...demoUser, name: me.name, teams: me.teams }
}

export async function signOut() {
  mockUser = null
  if (!useMock) await firebaseSignOut(auth)
}

export async function askQuestion(question, { country } = {}) {
  if (useMock) {
    // Demo mode ignores the question text: it returns the backend's answer to the
    // demo question for this country.
    await new Promise((resolve) => setTimeout(resolve, 300))
    const result = structuredClone(scenario().ask[country] ?? scenario().ask[meta.question.country])
    const mark = (items) => items.map((i) => ({ ...i, canEdit: mockCanEdit(i.passport, mockUser) }))
    return { ...result, question, results: mark(result.results), archived: mark(result.archived) }
  }
  return call('ask', { question, country })
}

export async function getPassport(passportId) {
  if (useMock) {
    const view = scenario().passports[passportId]
    return view ? withCanEdit(structuredClone(view)) : null
  }
  return call('getPassport', { passportId })
}

export async function confirmStillValid(passportId) {
  if (useMock) {
    const view = scenario().passports[passportId]
    if (!view || !mockCanEdit(view.passport, mockUser)) throw new Error("You can't confirm this passport.")
    if (view.archived) throw new Error("Archived passports can't be confirmed.")
    if (passportId !== meta.confirmedPassportId) {
      throw new Error('Demo mode: only the Global Payroll Harmonisation passport can be confirmed.')
    }
    confirmed = true
    return getPassport(passportId)
  }
  return call('confirmStillValid', { passportId })
}

// The backend answers with Claude using only this passport's sources; the API key
// stays on the backend as a Firebase secret, never in the frontend.
export async function askPassportAI(passportId, message) {
  if (useMock) {
    const { passport } = scenario().passports[passportId]
    const text = message.toLowerCase()
    const match = (mockAiAnswers[passportId] ?? []).find((a) => a.keywords.some((k) => text.includes(k)))
    await new Promise((resolve) => setTimeout(resolve, 600))
    if (!match) {
      return {
        answer: 'Demo mode has example answers for "Global Payroll Harmonisation" only: try asking about the go-live date, the owner, the countries or open issues.',
        citations: [],
      }
    }
    return {
      answer: match.answer,
      citations: match.citations.map((id) => ({ id, title: passport.linkedSources.find((s) => s.id === id)?.title ?? id })),
    }
  }
  return call('askPassportAI', { passportId, message })
}
