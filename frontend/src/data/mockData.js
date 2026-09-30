// Fictional demo data. Nothing here is real payroll advice.
//
// mockAskResults.json and mockPassports.json are the EXACT output of the backend
// (service/functions/src/scoring.ts on service/functions/src/seedData.ts, with
// "now" = 2026-09-30T12:00:00Z), so they have the same shape as the real API.
// Do not edit them by hand: regenerate them if the backend changes.
//
// mockAskResults[country][verifiedIds] is the backend's answer to the demo
// question for that country, where verifiedIds lists the sources verified during
// the demo (comma-separated, "" = none yet).

import mockAskResults from './mockAskResults.json'
import mockPassports from './mockPassports.json'

export { mockAskResults, mockPassports }

// Same as DEMO_QUESTION in service/functions/src/seedData.ts.
export const demoQuestion = {
  question: 'How is double holiday pay calculated for a part-time employee?',
  country: 'BE',
}

// Demo accounts. Real sign-in will come from Firebase Auth; the backend lets a
// user verify a source when their email equals the source's owner.contact.
export const demoUsers = [
  { uid: 'demo-sofie', name: 'Sofie Van Damme', email: 'sofie.vandamme@example.com', role: 'consultant', description: 'Payroll consultant: asks questions for clients' },
  { uid: 'demo-tom', name: 'Tom Peeters', email: 'tom.peeters@example.com', role: 'owner', description: 'Document owner: can confirm their own sources' },
]
