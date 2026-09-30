// Fictional demo data: fictional projects and people, not real payroll advice.
//
// ./generated/*.json is produced by the backend (`npm run export-mocks` in
// service/functions) from its real scoring code and demo data, so mock mode shows
// exactly what the backend returns. Do not edit those files by hand.
//   before.json        answers (BE, NL) and passports before any confirmation
//   afterConfirm.json  the same after Jane De Smet confirms Global Payroll Harmonisation
//   teams.json         team directory (who may confirm which passport)

import before from './generated/before.json'
import afterConfirm from './generated/afterConfirm.json'
import teams from './generated/teams.json'
import meta from './generated/meta.json'

export { before, afterConfirm, teams, meta }

// Demo accounts. Real sign-in will come from Firebase Auth (email identifies the team member).
export const demoUsers = [
  {
    id: 'person.sofie-vandamme',
    name: 'Sofie Van Damme',
    email: 'sofie.vandamme@example.com',
    role: 'consultant',
    description: 'Payroll consultant: asks questions for clients',
  },
  {
    id: 'person.jane-desmet',
    name: 'Jane De Smet',
    email: 'jane.desmet@example.com',
    role: 'owner',
    description: 'Member of the Transformation Office, which owns Global Payroll Harmonisation',
  },
]

// Example "Ask AI" answers, in the shape the backend returns ({ answer, citations }).
// With an API key the backend writes answers like these with Claude; the first entry
// whose keywords match the question is used. `citations` are linkedSources ids.
export const mockAiAnswers = {
  'passport.global-payroll-harmonisation': [
    {
      keywords: ['go-live', 'go live', 'date', 'when', 'deadline'],
      answer:
        'The sources disagree. The project plan (v1.4, 3 Sep 2026) says go-live on 1 January 2027 for all countries. A newer Teams thread (18 Sep 2026) says Belgium and the Netherlands move to 1 April 2027 because of an extra parallel run. The plan has not been updated yet, so check with Jane De Smet before giving a date to a client.',
      citations: ['doc.gph.project-plan', 'chat.gph.teams-go-live'],
    },
    {
      keywords: ['owner', 'who', 'responsible', 'contact'],
      answer:
        'The passport is owned by the Transformation Office; any member of that team can update and confirm it. Jane De Smet made the last update on 12 Sep 2026 and leads the team.',
      citations: ['doc.gph.change-log'],
    },
    {
      keywords: ['country', 'countries', 'scope', 'applies'],
      answer:
        'The project applies to 17 countries. The country readiness checklist covers 15 of them; Denmark and Finland have not started their readiness checks.',
      citations: ['doc.gph.country-checklist', 'doc.gph.scope-file-2024'],
    },
    {
      keywords: ['hr', 'issue', 'risk', 'missing'],
      answer:
        'There is one open issue: the impact on the HR module has not been analysed yet. The steering committee raised it as a risk in August 2026.',
      citations: ['email.gph.steering-committee'],
    },
  ],
}
