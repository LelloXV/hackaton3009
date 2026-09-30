// Single place for all data access. Screens only import from here.
// Today every function returns mock data; later each one becomes a fetch() to the
// backend, and the screens do not change.
//
// Passports follow the team contract (schemas/passport.schema.json) unchanged.
// The shapes below that wrap them are the frontend's PROPOSAL for the backend API:
//
// askQuestion(question) -> {
//   question: string,
//   context: { country: 'BE', client: 'client.atlas', module: 'pay' },  // query scope
//   answer: string,                  // text with inline citations like [1]
//   uncertainty: string | null,      // what is still not sure
//   sources: [{ ref: 1, passportId, passport }],
//   conflicts: [{ id, title, difference,
//                 sourceA: { ref, passportId, excerpt },
//                 sourceB: { ref, passportId, excerpt },
//                 expert: { id, name, reason, expertise: [string] } }],
// }
//
// getPassport(passportId) -> {
//   passport,                        // contract shape
//   content: string,                 // excerpt of the source
//   versionNotes: [{ version, date, summary }],  // "what changed" per version
// }

import { passports as mockPassports, users, clientNames, passportDetails, demoAnswer } from './data/mockData'

// In-memory copy so "Confirm still valid" can change it during the demo.
const passports = structuredClone(mockPassports)

function findPassport(passportId) {
  return passports.find((p) => p.id === passportId)
}

export async function getUsers() {
  return users
}

export function getClientName(clientId) {
  return clientNames[clientId] ?? clientId
}

export async function askQuestion(question) {
  // The mock ignores the question text and always returns the demo answer.
  return {
    ...demoAnswer,
    question,
    sources: demoAnswer.sources.map((s) => ({ ...s, passport: findPassport(s.passportId) })),
  }
}

export async function getPassport(passportId) {
  const passport = findPassport(passportId)
  if (!passport) return null
  const details = passportDetails[passportId] ?? { content: '', versionNotes: [] }
  return { passport, ...details }
}

// The owner confirms the current version is still correct. Following the contract:
// append a "verified" stamp for the current version and set lastVerifiedAt.
// This does not resolve open conflicts.
export async function confirmStillValid(passportId, user) {
  const passport = findPassport(passportId)
  if (!passport || passport.owner?.id !== user.id) {
    throw new Error('Only the owner can confirm this document.')
  }
  const at = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  passport.stamps.push({
    id: `stamp.${passport.id}.verified.${Date.now()}`,
    type: 'verified',
    at,
    actor: { id: user.id, name: user.name, type: 'person' },
    version: passport.version,
    note: 'Owner confirmed this version is still valid.',
    relatedStampIds: [],
  })
  passport.lastVerifiedAt = at
  return getPassport(passportId)
}
