// FICTIONAL demo data for the hackathon scenario (not real payroll rules).
// Example A from the brief: Sarah gets an urgent question from a Belgian client.
// The assistant finds 3 documents (no owner / recently edited / other country)
// and a Teams chat with different information.
import { IngestInput } from "./schemas";

export const DEMO_QUESTION = {
  question: "How is double holiday pay calculated for a part-time employee?",
  country: "BE",
};

export const SEED_SOURCES: (IngestInput & { id: string })[] = [
  {
    id: "be-holiday-pay-policy-v3",
    title: "Holiday pay policy Belgium v3",
    sourceType: "policy",
    owner: null, // the author left the team; nobody took the document over
    lastEditedAt: "2025-06-12T09:00:00Z",
    lastVerifiedAt: null,
    reviewIntervalDays: 180,
    scope: { countries: ["BE"], clients: [], modules: ["Pay"] },
    text: `Double holiday pay for employees in Belgium.

Double holiday pay equals 92% of the gross monthly salary. For a part-time employee it is calculated pro rata on the part-time fraction of the reference year, based on the months actually worked.

Payment is made together with the May payroll run unless the client contract specifies otherwise.`,
  },
  {
    id: "be-holiday-pay-procedure-draft",
    title: "Holiday pay procedure BE (draft update)",
    sourceType: "procedure",
    owner: { name: "Tom Peeters", team: "Payroll Operations BE", contact: "tom.peeters@example.com" },
    lastEditedAt: "2026-09-28T15:30:00Z", // edited two days before the demo...
    lastVerifiedAt: "2026-01-10T10:00:00Z", // ...but verified long before that edit
    reviewIntervalDays: 180,
    scope: { countries: ["BE"], clients: [], modules: ["Pay"] },
    text: `Procedure: calculating double holiday pay for part-time employees.

Step 1: take the gross monthly salary of the part-time employee.
Step 2: double holiday pay is 85% of that monthly salary, pro rata for the months worked in the reference year.
Step 3: enter the amount in the holiday pay component before the May payroll run.`,
  },
  {
    id: "nl-vakantiegeld-procedure",
    title: "Vakantiegeld procedure Netherlands",
    sourceType: "procedure",
    owner: { name: "Anouk de Vries", team: "Payroll Operations NL", contact: "anouk.devries@example.com" },
    lastEditedAt: "2026-05-02T08:00:00Z",
    lastVerifiedAt: "2026-05-02T08:00:00Z",
    reviewIntervalDays: 365,
    scope: { countries: ["NL"], clients: [], modules: ["Pay"] },
    text: `Holiday pay (vakantiegeld) for part-time employees in the Netherlands.

Holiday pay is at least 8% of the gross annual salary. For a part-time employee it is calculated on the actual salary earned, so it follows the part-time fraction automatically. Payment is usually made in May or June.`,
  },
  {
    id: "teams-payroll-be-thread",
    title: "Teams #payroll-be thread: part-time holiday pay",
    sourceType: "teams_chat",
    owner: { name: "Lisa Janssens", team: "Payroll Expertise Centre BE", contact: "lisa.janssens@example.com" },
    lastEditedAt: "2026-09-29T11:12:00Z",
    lastVerifiedAt: null,
    reviewIntervalDays: 90,
    scope: { countries: ["BE"], clients: [], modules: ["Pay"] },
    text: `Lisa: careful with the new draft procedure, the percentage in step 2 is wrong. For part-time employees we still pay double holiday pay at 92% of the monthly salary, pro rata on the part-time fraction and the months worked. I asked Tom to fix the draft.`,
  },
];
