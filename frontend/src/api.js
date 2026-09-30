// Single place for all data access. Screens only import from here.
//
// Shapes are exactly the backend's (service/functions/src/types.ts):
//   askQuestion(question, { country, client }) -> AskResult    (callable "ask")
//   getPassport(passportId)                    -> Passport     (Firestore "passports/{id}")
//   verifySource(passportId)                   -> { passportId, lastVerifiedAt }  (callable "verifySource")
//
// To use the real backend: set USE_MOCK to false and fill in the Firebase calls
// below (needs the `firebase` package and the project config; see the notes there).

import { demoUsers, mockAskResults, mockPassports } from './data/mockData'

const USE_MOCK = true

// In-memory copy so verifying a source is visible during the demo.
const passports = structuredClone(mockPassports)
const verifiedInDemo = new Set()

export async function getUsers() {
  return demoUsers
}

export async function askQuestion(question, { country, client } = {}) {
  if (USE_MOCK) {
    // The mock ignores the question text: it returns the backend's answer to the
    // demo question for this country, taking into account sources verified so far.
    const byCountry = mockAskResults[country] ?? mockAskResults.BE
    const key = [...verifiedInDemo].sort().join(',')
    return structuredClone(byCountry[key] ?? byCountry[''])
  }
  // Real call (backend region europe-west1):
  //   const ask = httpsCallable(functions, 'ask')
  //   const { data } = await ask({ question, country, client })
  //   return data
  throw new Error(`Backend not connected yet (question: ${question}, ${country ?? ''} ${client ?? ''})`)
}

export async function getPassport(passportId) {
  if (USE_MOCK) {
    return structuredClone(passports.find((p) => p.id === passportId) ?? null)
  }
  // Real call: signed-in users may read passports directly (firestore.rules):
  //   const snap = await getDoc(doc(db, 'passports', passportId))
  //   return snap.exists() ? snap.data() : null
  throw new Error('Backend not connected yet')
}

// Only the owner can verify: the backend checks that the signed-in user's
// verified email equals owner.contact. The mock does the same check.
export async function verifySource(passportId, user) {
  if (USE_MOCK) {
    const passport = passports.find((p) => p.id === passportId)
    if (!passport || passport.owner?.contact.toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("You can't verify this source.")
    }
    passport.lastVerifiedAt = new Date().toISOString()
    verifiedInDemo.add(passportId)
    return { passportId, lastVerifiedAt: passport.lastVerifiedAt }
  }
  // Real call:
  //   const verify = httpsCallable(functions, 'verifySource')
  //   const { data } = await verify({ passportId })
  //   return data
  throw new Error('Backend not connected yet')
}
