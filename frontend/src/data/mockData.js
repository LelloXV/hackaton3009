// Fictional demo data. Nothing here is real payroll advice.
//
// Passports (./passports/*.json) follow the team contract exactly
// (../../../schemas/passport.schema.json) and pass scripts/validate_passports.py.
// Everything else in this file (users, answer text, conflicts, version notes) is
// NOT part of that contract: it is the frontend's proposal for what the backend
// API returns around the passports. See src/api.js for the shapes.

import beHolidayLeave from './passports/be-holiday-leave.json'
import beHolidayLeave2024Copy from './passports/be-holiday-leave-2024-copy.json'
import beTeamsChatAtlas from './passports/be-teams-chat-atlas.json'
import beEmailNewHire from './passports/be-email-new-hire.json'
import nlHolidayLeave from './passports/nl-holiday-leave.json'

export const passports = [beHolidayLeave, beHolidayLeave2024Copy, beTeamsChatAtlas, beEmailNewHire, nlHolidayLeave]

// Demo accounts, one per role. Real authentication will come from the backend.
export const users = [
  { id: 'person.sofie-vandamme', name: 'Sofie Van Damme', role: 'consultant' },
  { id: 'person.marc-peeters', name: 'Marc Peeters', role: 'owner' },
]

// Clients are opaque IDs in the contract; the UI needs a display name.
export const clientNames = {
  'client.atlas': 'Client Atlas SA',
}

// Content excerpt and "what changed" notes per passport (outside the contract).
export const passportDetails = {
  'passport.be.holiday-leave': {
    content:
      'Holiday leave accrues at 6% of the gross annual salary, calculated monthly. Employees hired after 1 January 2025 accrue leave pro-rata from their month of entry.',
    versionNotes: [
      { version: 1, date: '2024-02-03T09:00:00Z', summary: 'First version. New hires start accruing from the first full calendar year after hiring.' },
      { version: 2, date: '2025-01-15T09:00:00Z', summary: 'Added a monthly calculation example. No rule changes.' },
      { version: 3, date: '2026-07-12T10:00:00Z', summary: 'New hires now accrue pro-rata from their month of entry, instead of waiting for the first full calendar year.' },
    ],
  },
  'passport.be.holiday-leave-2024-copy': {
    content:
      'Holiday leave accrues at 6% of the gross annual salary. New hires start accruing from the first full calendar year after hiring.',
    versionNotes: [
      { version: 1, date: '2024-02-05T09:00:00Z', summary: 'Copy of the Belgian procedure (version 1) saved for Client Atlas SA.' },
    ],
  },
  'passport.be.teams-chat-atlas': {
    content:
      'Marc: "Careful, for Atlas we still use the old rule for new hires. The client has not formally approved the new procedure yet." No later update in the thread.',
    versionNotes: [
      { version: 1, date: '2026-05-15T16:20:00Z', summary: 'Imported from Microsoft Teams.' },
    ],
  },
  'passport.be.email-new-hire': {
    content:
      'A colleague asks whether an employee hired in April 2026 accrues holiday leave pro-rata or waits for the first full year. No final answer in the thread.',
    versionNotes: [
      { version: 1, date: '2026-06-20T08:45:00Z', summary: 'Imported from Outlook.' },
    ],
  },
  'passport.nl.holiday-leave': {
    content:
      'Holiday leave accrues based on weekly contractual hours, with a statutory minimum of four times the weekly working hours.',
    versionNotes: [
      { version: 1, date: '2025-03-01T09:00:00Z', summary: 'First version.' },
      { version: 2, date: '2026-03-01T09:00:00Z', summary: 'Updated for the 2026 statutory minimum.' },
    ],
  },
}

// The pre-built answer for the demo question.
export const demoAnswer = {
  question: 'How is holiday leave calculated in Belgium for a new hire at Client Atlas SA?',
  context: { country: 'BE', client: 'client.atlas', module: 'pay' },
  answer:
    'Holiday leave in Belgium accrues at 6% of the gross annual salary, calculated monthly [1]. For new hires, the current procedure applies a pro-rata rule from the month of entry [1]. However, a recent Teams discussion says Client Atlas SA may still apply the previous rule, where new hires wait for the first full calendar year [2], as described in an older copy of the procedure [3].',
  uncertainty:
    'It is not confirmed whether Client Atlas SA formally approved the new procedure. Check with the owner before answering the client.',
  sources: [
    { ref: 1, passportId: 'passport.be.holiday-leave' },
    { ref: 2, passportId: 'passport.be.teams-chat-atlas' },
    { ref: 3, passportId: 'passport.be.holiday-leave-2024-copy' },
    { ref: 4, passportId: 'passport.be.email-new-hire' },
    { ref: 5, passportId: 'passport.nl.holiday-leave' },
  ],
  conflicts: [
    {
      id: 'conflict.be.new-hire-accrual',
      title: 'When do new hires start accruing holiday leave?',
      sourceA: { ref: 1, passportId: 'passport.be.holiday-leave', excerpt: 'New hires accrue leave pro-rata from their month of entry.' },
      sourceB: { ref: 2, passportId: 'passport.be.teams-chat-atlas', excerpt: 'For Atlas we still use the old rule: new hires wait for the first full calendar year.' },
      difference:
        'Source A starts accrual in the month of entry. Source B says Client Atlas SA still waits for the first full calendar year. For an employee hired in April, this changes the leave for the rest of the year.',
      expert: {
        id: 'person.marc-peeters',
        name: 'Marc Peeters',
        reason: 'Owner of the Belgian holiday leave procedure and author of the Teams message.',
        expertise: ['Belgian payroll', 'Holiday leave'],
      },
    },
  ],
}
