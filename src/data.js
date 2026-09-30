export const sources = [
  {
    "id": 1,
    "name": "Global payroll project plan",
    "type": "SharePoint",
    "short": "SP",
    "date": "01 Sep 2026",
    "color": "teal",
    "content": "Version 1.4 · Owner: Transformation Office. Harmonise payroll across 17 countries. Target go-live: 1 November 2026. The approved scope covers payroll processing and reporting. Country deployment work is in progress."
  },
  {
    "id": 2,
    "name": "Payroll rollout discussion",
    "type": "Microsoft Teams",
    "short": "T",
    "date": "15 Sep 2026",
    "color": "purple",
    "content": "Rollout channel · The project team proposes moving go-live to 15 November 2026 to complete local testing. This change has not yet been approved or reflected in the project plan. The HR module impact is still an open question."
  },
  {
    "id": 3,
    "name": "Country scope matrix",
    "type": "Excel",
    "short": "X",
    "date": "20 Aug 2026",
    "color": "green",
    "content": "Country scope matrix · 15 of 17 countries are documented: BE, NL, FR, DE, ES, PT, IT, AT, LU, IE, UK, PL, CZ, DK and SE. Norway and Finland are pending. Payroll processing and reporting are included; HR integration is not documented."
  },
  {
    "id": 4,
    "name": "Project decisions & change log",
    "type": "Confluence",
    "short": "C",
    "date": "12 Sep 2026",
    "color": "blue",
    "content": "Latest update: 12 September 2026 by Jane De Smet. Department: Pay · Payroll Operations. Accountable unit: Transformation Office. Status: On track. Last formal owner review: 10 May 2026. Action: confirm the rollout date and complete the country scope."
  }
];

export const questions = [
  {
    "label": "What is the status of global payroll?",
    "keywords": [
      "status",
      "track",
      "progress"
    ],
    "answer": "Global Payroll Harmonisation is on track, according to the latest change log. There are still two things to resolve: conflicting go-live dates and incomplete country scope.",
    "refs": [
      4,
      1,
      2,
      3
    ]
  },
  {
    "label": "Who owns this project?",
    "keywords": [
      "owns",
      "owner",
      "responsible",
      "who"
    ],
    "answer": "The Transformation Office owns this project, within Pay · Payroll Operations. Jane De Smet posted the latest update. The owner’s last formal review was on 10 May, so a fresh review is needed.",
    "refs": [
      4,
      1
    ]
  },
  {
    "label": "When is the go-live date?",
    "keywords": [
      "go-live",
      "go live",
      "launch",
      "date",
      "when"
    ],
    "answer": "The go-live date needs confirmation. The project plan says 1 November 2026, but the Teams discussion proposes 15 November 2026. The owner should resolve this conflict before you rely on either date.",
    "refs": [
      1,
      2
    ]
  },
  {
    "label": "Which countries are in scope?",
    "keywords": [
      "countries",
      "country",
      "scope",
      "where"
    ],
    "answer": "15 of 17 countries are documented, including Belgium, the Netherlands, France, Germany and Spain. Norway and Finland are still pending in the country scope matrix.",
    "refs": [
      3,
      1
    ]
  },
  {
    "label": "How reliable is this information?",
    "keywords": [
      "reliable",
      "confidence",
      "trust",
      "score"
    ],
    "answer": "The passport has a confidence score of 67/100. Ownership and recent updates are clear, but a date conflict, missing HR details and an overdue owner review reduce confidence.",
    "refs": [
      1,
      2,
      3,
      4
    ]
  },
  {
    "label": "What are the main open issues?",
    "keywords": [
      "issues",
      "missing",
      "gaps",
      "risks"
    ],
    "answer": "The main open issues are the conflicting go-live dates, missing scope for Norway and Finland, and undocumented HR module impact. The Transformation Office should confirm and update these details.",
    "refs": [
      2,
      3,
      4
    ]
  },
  {
    "label": "When was the project last updated?",
    "keywords": [
      "updated",
      "latest",
      "fresh",
      "recent"
    ],
    "answer": "Jane De Smet last updated the project change log on 12 September 2026. The Teams discussion has a newer proposed date, from 15 September, which has not yet been incorporated into the plan.",
    "refs": [
      4,
      2
    ]
  },
  {
    "label": "Which sources were used?",
    "keywords": [
      "sources",
      "resources",
      "documents",
      "used"
    ],
    "answer": "This passport brings together four fictional resources: the SharePoint project plan, a Microsoft Teams rollout discussion, an Excel country scope matrix, and the Confluence change log. Open any source to inspect its contents.",
    "refs": [
      1,
      2,
      3,
      4
    ]
  },
  {
    "label": "Are there conflicting details?",
    "keywords": [
      "conflict",
      "conflicting",
      "agree",
      "contradiction"
    ],
    "answer": "Yes. The SharePoint project plan lists a 1 November go-live, while the Teams discussion proposes 15 November. The proposal is not approved, so the passport flags the discrepancy for owner review.",
    "refs": [
      1,
      2
    ]
  },
  {
    "label": "What should we do next?",
    "keywords": [
      "next",
      "action",
      "do",
      "recommend"
    ],
    "answer": "Ask the Transformation Office to confirm the go-live date, document the two remaining countries and HR module impact, then perform a fresh owner review. These steps would improve the passport’s confidence.",
    "refs": [
      1,
      2,
      3,
      4
    ]
  }
];

export const criteria = [
  {
    "name": "Source quality",
    "max": 20,
    "points": 18,
    "status": "OK",
    "detail": "Four traceable internal sources"
  },
  {
    "name": "Recency",
    "max": 20,
    "points": 20,
    "status": "OK",
    "detail": "Updated 12 Sep 2026"
  },
  {
    "name": "Consistency",
    "max": 15,
    "points": 5,
    "status": "Conflict",
    "detail": "Two different go-live dates"
  },
  {
    "name": "Scope completeness",
    "max": 15,
    "points": 10,
    "status": "Partial",
    "detail": "15 of 17 countries documented"
  },
  {
    "name": "Owner review",
    "max": 10,
    "points": 4,
    "status": "Stale",
    "detail": "Last reviewed 10 May 2026"
  },
  {
    "name": "Applicability",
    "max": 10,
    "points": 8,
    "status": "Partial",
    "detail": "HR module impact not documented"
  },
  {
    "name": "Open questions",
    "max": 10,
    "points": 2,
    "status": "Missing",
    "detail": "Date and scope need confirmation"
  }
];

export const score = criteria.reduce((sum, item) => sum + item.points, 0);
