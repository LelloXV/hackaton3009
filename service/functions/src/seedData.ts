// FICTIONAL demo data for the hackathon scenario (fictional projects and people, not payroll advice).
// Story: Sofie, a payroll consultant, is asked when payroll harmonisation goes live in Belgium.
// The project plan says 1 January 2027, a newer Teams thread and the Belgian cut-over plan say
// 1 April 2027, and an old pilot (now archived) said 1 January 2026.
import { Actor, Passport, Team } from "./types";

export const DEMO_QUESTION = { question: "When does payroll harmonisation go live in Belgium?", country: "BE" };
export const DEMO_NOW = new Date("2026-09-30T12:00:00Z");

const jane: Actor = { id: "person.jane-desmet", name: "Jane De Smet", type: "person" };
const lotte: Actor = { id: "person.lotte-maes", name: "Lotte Maes", type: "person" };
const pieter: Actor = { id: "person.pieter-claes", name: "Pieter Claes", type: "person" };

export const TEAMS: Team[] = [
  {
    id: "team.transformation-office",
    name: "Transformation Office",
    lead: { id: jane.id, name: jane.name, email: "jane.desmet@example.com" },
    members: [
      { id: jane.id, name: jane.name, email: "jane.desmet@example.com" },
      { id: "person.marc-dubois", name: "Marc Dubois", email: "marc.dubois@example.com" },
    ],
    expertise: ["Programme lead, Global Payroll Harmonisation", "Payroll process design"],
  },
  {
    id: "team.payroll-ops-be",
    name: "Payroll Operations BE",
    lead: { id: lotte.id, name: lotte.name, email: "lotte.maes@example.com" },
    members: [
      { id: lotte.id, name: lotte.name, email: "lotte.maes@example.com" },
      { id: "person.tom-peeters", name: "Tom Peeters", email: "tom.peeters@example.com" },
    ],
    expertise: ["Belgian payroll", "Go-live and cut-over"],
  },
  {
    // Pieter Claes left the company; the team still owns his pilot passport.
    id: "team.payroll-ops",
    name: "Payroll Operations",
    lead: { id: "person.anouk-devries", name: "Anouk de Vries", email: "anouk.devries@example.com" },
    members: [{ id: "person.anouk-devries", name: "Anouk de Vries", email: "anouk.devries@example.com" }],
    expertise: ["Payroll operations"],
  },
];

const teamActor = (id: string): Actor => ({ id, name: TEAMS.find((t) => t.id === id)!.name, type: "team" });

export interface SeedPassport {
  passport: Passport;
  sourceTexts: Record<string, string>;
}

const TEAMS_THREAD = `Jane De Smet: Update for Belgium and the Netherlands: go-live moves to 1 April 2027 because the client needs an extra parallel run. I will update the project plan next week.

Lotte Maes: Noted, the Belgian cut-over plan already uses the new date.`;

const PILOT_REPORT = `Harmonisation pilot report 2024. The pilot in Belgium and the Netherlands planned go-live for 1 January 2026. The global programme replaced this plan.`;

export const SEED_PASSPORTS: SeedPassport[] = [
  {
    passport: {
      schemaVersion: "1.1.0",
      id: "passport.global-payroll-harmonisation",
      reference: "#241",
      title: "Global Payroll Harmonisation",
      description:
        "Harmonise payroll processes and configurations across key countries to improve efficiency, compliance and data quality.",
      issuer: jane,
      owner: teamActor("team.transformation-office"),
      createdAt: "2025-11-03T09:00:00Z",
      updatedAt: "2026-09-12T14:20:00Z",
      updatedBy: jane,
      lastVerifiedAt: null,
      expiresAt: "2027-06-30T17:00:00Z",
      visa: {
        countries: { mode: "listed", values: ["BE", "NL", "FR", "DE", "ES", "LU", "AT", "IT", "PT", "IE", "PL", "CZ", "SK", "HU", "DK", "SE", "FI"] },
        clients: { mode: "all", values: [] },
        modules: { mode: "listed", values: ["pay", "hr", "time"] },
      },
      departments: ["Pay · Payroll Operations", "HR · HR Operations", "Time · Workforce Management", "Finance · Payroll Accounting"],
      sourceType: "project",
      source: { id: "jira.pay-241", uri: "https://jira.example.com/browse/PAY-241" },
      version: 3,
      stamps: [
        { id: "stamp.gph.verified.v1", type: "verified", at: "2025-11-10T10:00:00Z", actor: jane, version: 1, note: "Initial scope and plan reviewed.", relatedStampIds: [] },
        { id: "stamp.gph.verified.v2", type: "verified", at: "2026-05-20T09:30:00Z", actor: jane, version: 2, note: "Extended scope (17 countries) reviewed.", relatedStampIds: [] },
        {
          id: "stamp.gph.conflict.v3",
          type: "conflict",
          at: "2026-09-18T16:05:00Z",
          actor: { id: "system.conflict-detector", name: "Conflict Detector", type: "system" },
          version: 3,
          note: "Conflicting go-live date: the project plan (v1.4) says 1 January 2027, the Teams thread of 18 Sep 2026 says 1 April 2027.",
          relatedStampIds: [],
        },
        {
          id: "stamp.gph.note.v3",
          type: "note",
          at: "2026-09-20T08:00:00Z",
          actor: { id: "system.coverage-check", name: "Coverage Check", type: "system" },
          version: 3,
          note: "HR module impact is not covered by any source.",
          relatedStampIds: [],
        },
      ],
      linkedSources: [
        { id: "doc.gph.project-plan", title: "Project plan", sourceType: "document", app: "SharePoint", version: "v1.4", updatedAt: "2026-09-03T10:00:00Z", countries: [], uri: "https://sharepoint.example.com/gph/project-plan", relation: "supports" },
        { id: "chat.gph.teams-go-live", title: "Teams thread", sourceType: "chat", app: "Microsoft Teams", version: null, updatedAt: "2026-09-18T15:40:00Z", countries: ["BE", "NL"], uri: "https://teams.example.com/gph/go-live", relation: "contradicts" },
        { id: "doc.gph.scope-file-2024", title: "Scope file 2024", sourceType: "business_record", app: "Excel", version: null, updatedAt: "2024-03-14T09:00:00Z", countries: ["BE", "NL", "FR", "DE", "ES", "LU", "IT", "PT", "IE", "SE"], uri: "https://sharepoint.example.com/gph/scope-2024.xlsx", relation: "derived_from" },
        { id: "doc.gph.change-log", title: "Change log", sourceType: "document", app: "Confluence", version: null, updatedAt: "2026-09-12T14:20:00Z", countries: [], uri: "https://confluence.example.com/gph/change-log", relation: "supports" },
        { id: "email.gph.steering-committee", title: "Steering committee minutes", sourceType: "email", app: "Outlook", version: null, updatedAt: "2026-08-28T12:00:00Z", countries: [], uri: "https://mail.example.com/gph/steering-2026-08", relation: "supports" },
        { id: "doc.gph.country-checklist", title: "Country readiness checklist", sourceType: "business_record", app: "Excel", version: "v7", updatedAt: "2026-07-15T09:00:00Z", countries: ["BE", "NL", "FR", "DE", "ES", "LU", "AT", "IT", "PT", "IE", "PL", "CZ", "SK", "HU", "SE"], uri: "https://sharepoint.example.com/gph/country-checklist.xlsx", relation: "supports" },
        { id: "note.gph.germany-expert", title: "Germany payroll expert note", sourceType: "expert_note", app: "OneNote", version: null, updatedAt: "2026-08-02T09:00:00Z", countries: ["DE"], uri: "https://onenote.example.com/gph/germany", relation: "supports" },
        { id: "doc.gph.pilot-report-2024", title: "Harmonisation pilot report 2024", sourceType: "document", app: "SharePoint", version: "v2.0", updatedAt: "2024-06-30T16:00:00Z", countries: ["BE", "NL"], uri: "https://sharepoint.example.com/pilot/report", relation: "supersedes" },
      ],
      openIssues: [{ id: "issue.gph.hr-impact", title: "HR module impact not covered", severity: "major", openedAt: "2026-09-20T08:00:00Z" }],
      updates: [
        { version: 1, at: "2025-11-03T09:00:00Z", actor: jane, summary: "Project started: 12 countries in scope, go-live 1 January 2027." },
        { version: 2, at: "2026-05-12T11:00:00Z", actor: jane, summary: "Scope extended from 12 to 17 countries (added AT, PL, CZ, SK, HU)." },
        { version: 3, at: "2026-09-12T14:20:00Z", actor: jane, summary: "Project plan updated to v1.4 and change log added. Go-live date unchanged (1 January 2027)." },
      ],
      related: [
        { passportId: "passport.be-payroll-go-live", title: "Belgium payroll go-live readiness", relation: "Country workstream" },
        { passportId: "passport.payroll-harmonisation-pilot-2024", title: "Payroll Harmonisation Pilot 2024", relation: "Earlier pilot (replaced)" },
      ],
    },
    sourceTexts: {
      "doc.gph.project-plan": `Global Payroll Harmonisation project plan, version 1.4.

Objective: one harmonised payroll process and configuration for 17 countries.

Go-live for all countries in scope: 1 January 2027. A parallel run is planned in the last quarter of 2026.`,
      "chat.gph.teams-go-live": TEAMS_THREAD,
      "doc.gph.scope-file-2024": `Scope file 2024. Countries in scope of the harmonisation programme in 2024: BE, NL, FR, DE, ES, LU, IT, PT, IE and SE.`,
      "doc.gph.change-log": `Change log. Version 1.4 of the project plan: timeline section rewritten, go-live date unchanged. Version 1.3: added AT, PL, CZ, SK and HU to the scope.`,
      "email.gph.steering-committee": `Steering committee minutes, August 2026. The committee confirmed the scope of 17 countries. Risk raised: the impact on the HR module has not been analysed yet. Action for the Transformation Office.`,
      "doc.gph.country-checklist": `Country readiness checklist. Readiness data is available for 15 of the 17 countries. Denmark and Finland have not started their readiness checks.`,
      "note.gph.germany-expert": `Germany payroll expert note. German payroll needs a separate church tax configuration. This does not change the harmonised process design.`,
      "doc.gph.pilot-report-2024": PILOT_REPORT,
    },
  },
  {
    passport: {
      schemaVersion: "1.1.0",
      id: "passport.be-payroll-go-live",
      reference: "#287",
      title: "Belgium payroll go-live readiness",
      description: "Country workstream of Global Payroll Harmonisation: readiness checks and cut-over plan for Belgium.",
      issuer: lotte,
      owner: teamActor("team.payroll-ops-be"),
      createdAt: "2026-06-01T09:00:00Z",
      updatedAt: "2026-09-10T11:00:00Z",
      updatedBy: lotte,
      lastVerifiedAt: "2026-09-15T15:00:00Z",
      expiresAt: "2027-04-30T17:00:00Z",
      visa: {
        countries: { mode: "listed", values: ["BE"] },
        clients: { mode: "all", values: [] },
        modules: { mode: "listed", values: ["pay"] },
      },
      departments: ["Pay · Payroll Operations BE"],
      sourceType: "project",
      source: { id: "jira.pay-287", uri: "https://jira.example.com/browse/PAY-287" },
      version: 2,
      stamps: [
        { id: "stamp.be-go-live.verified.v1", type: "verified", at: "2026-06-05T10:00:00Z", actor: lotte, version: 1, note: "Workstream plan reviewed with the client.", relatedStampIds: [] },
        { id: "stamp.be-go-live.verified.v2", type: "verified", at: "2026-09-15T15:00:00Z", actor: lotte, version: 2, note: "Cut-over plan reviewed; go-live 1 April 2027 confirmed with the client.", relatedStampIds: [] },
      ],
      linkedSources: [
        { id: "doc.be.cutover-plan", title: "Cut-over plan Belgium", sourceType: "business_record", app: "Excel", version: "v3", updatedAt: "2026-09-10T11:00:00Z", countries: ["BE"], uri: "https://sharepoint.example.com/be/cutover-plan.xlsx", relation: "supports" },
        { id: "chat.gph.teams-go-live", title: "Teams thread", sourceType: "chat", app: "Microsoft Teams", version: null, updatedAt: "2026-09-18T15:40:00Z", countries: ["BE", "NL"], uri: "https://teams.example.com/gph/go-live", relation: "supports" },
        { id: "doc.be.readiness-checklist", title: "Readiness checklist Belgium", sourceType: "document", app: "Confluence", version: null, updatedAt: "2026-09-08T09:00:00Z", countries: ["BE"], uri: "https://confluence.example.com/be/readiness", relation: "supports" },
      ],
      openIssues: [{ id: "issue.be.parallel-run", title: "Parallel run schedule not final", severity: "minor", openedAt: "2026-09-15T15:00:00Z" }],
      updates: [
        { version: 1, at: "2026-06-01T09:00:00Z", actor: lotte, summary: "Workstream set up; target go-live 1 April 2027 agreed with the client." },
        { version: 2, at: "2026-09-10T11:00:00Z", actor: lotte, summary: "Cut-over plan added." },
      ],
      related: [{ passportId: "passport.global-payroll-harmonisation", title: "Global Payroll Harmonisation", relation: "Parent project" }],
    },
    sourceTexts: {
      "doc.be.cutover-plan": `Cut-over plan Belgium, version 3. Go-live: 1 April 2027. Parallel run from January to March 2027 with two payroll cycles compared.`,
      "chat.gph.teams-go-live": TEAMS_THREAD,
      "doc.be.readiness-checklist": `Readiness checklist Belgium. All interfaces tested. Employee data migration rehearsal passed. Open: the parallel run schedule is not final.`,
    },
  },
  {
    passport: {
      schemaVersion: "1.1.0",
      id: "passport.payroll-harmonisation-pilot-2024",
      reference: "#112",
      title: "Payroll Harmonisation Pilot 2024",
      description: "Pilot in Belgium and the Netherlands that tested a common payroll process before the global programme.",
      issuer: pieter,
      owner: teamActor("team.payroll-ops"),
      createdAt: "2024-01-15T09:00:00Z",
      updatedAt: "2024-06-30T16:00:00Z",
      updatedBy: pieter,
      lastVerifiedAt: "2024-07-01T10:00:00Z",
      expiresAt: "2024-12-31T17:00:00Z",
      visa: {
        countries: { mode: "listed", values: ["BE", "NL"] },
        clients: { mode: "all", values: [] },
        modules: { mode: "listed", values: ["pay"] },
      },
      departments: ["Pay · Payroll Operations"],
      sourceType: "project",
      source: { id: "jira.pay-112", uri: "https://jira.example.com/browse/PAY-112" },
      version: 1,
      stamps: [
        { id: "stamp.pilot.verified.v1", type: "verified", at: "2024-07-01T10:00:00Z", actor: pieter, version: 1, note: "Pilot results reviewed.", relatedStampIds: [] },
        {
          id: "stamp.pilot.note.v1",
          type: "note",
          at: "2024-12-31T17:00:00Z",
          actor: { id: "system.archive", name: "Archive", type: "system" },
          version: 1,
          note: "Pilot finished and replaced by the global programme. Passport moved to the archive.",
          relatedStampIds: [],
        },
      ],
      linkedSources: [
        { id: "doc.gph.pilot-report-2024", title: "Harmonisation pilot report 2024", sourceType: "document", app: "SharePoint", version: "v2.0", updatedAt: "2024-06-30T16:00:00Z", countries: ["BE", "NL"], uri: "https://sharepoint.example.com/pilot/report", relation: "supports" },
        { id: "doc.pilot.planning", title: "Pilot planning", sourceType: "business_record", app: "Excel", version: null, updatedAt: "2024-02-01T09:00:00Z", countries: [], uri: "https://sharepoint.example.com/pilot/planning.xlsx", relation: "supports" },
      ],
      openIssues: [],
      updates: [
        { version: 1, at: "2024-06-30T16:00:00Z", actor: pieter, summary: "Final pilot report: go-live for BE and NL planned for 1 January 2026 (later replaced by the global programme)." },
      ],
      related: [{ passportId: "passport.global-payroll-harmonisation", title: "Global Payroll Harmonisation", relation: "Replaced by" }],
    },
    sourceTexts: {
      "doc.gph.pilot-report-2024": PILOT_REPORT,
      "doc.pilot.planning": `Pilot planning. Kick-off in February 2024, final report in June 2024.`,
    },
  },
];
