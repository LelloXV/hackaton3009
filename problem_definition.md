# SD Worx Challenge: Problem Definition

*Captured live at the SD Worx challenge presentation, 30 September 2026.*
*Slide text was read from phone photos; items marked (?) were blurry and are best guesses.*

---

## Contents

1. [The challenge in one sentence](#1-the-challenge-in-one-sentence)
2. [Company context: who is SD Worx](#2-company-context-who-is-sd-worx)
3. [The product: mysdworx](#3-the-product-mysdworx)
4. [The problem: knowledge spread everywhere](#4-the-problem-knowledge-spread-everywhere)
5. [Real-life examples](#5-real-life-examples)
6. [The official challenge statement](#6-the-official-challenge-statement)
7. [Possible directions](#7-possible-directions-given-by-sd-worx)
8. [Problem analysis](#8-problem-analysis)
9. [Key concept: RAG (and why it is not enough)](#9-key-concept-rag-and-why-it-is-not-enough)
10. [Candidate solution directions](#10-candidate-solution-directions)
11. [Open questions to ask SD Worx](#11-open-questions-to-ask-sd-worx)
12. [Slide index](#12-slide-index)

---

## 1. The challenge in one sentence

> **Find it. Understand it. Trust it.**
> *How might we turn fragmented organisational knowledge into a trusted shared resource?*

Build a **focused proof of concept** that makes organisational knowledge easier to **find, trust or share**. Choose one meaningful problem; you do not need to solve everything. → [Official brief](#slide-11), [Slide 09](#slide-09)

### What the official brief adds (read this first)
- **"This is fundamentally a trust problem."** A search can return ten answers and an AI can summarise them; the hard part is knowing whether an answer is reliable, current and relevant to *this* customer, country or situation.
- A useful solution shows **not only an answer, but why it deserves confidence, where uncertainty remains, and who can help** when documents are not enough.
- The goal is to move someone **from "I found something" to "I understand why I can rely on it."**
- **"Do not start with prescribed technology. Start with the moment of doubt, friction or uncertainty that you want to change."**
- **Focus on one role, one workflow, one knowledge source or one trust signal.** Make the moment of doubt tangible, then demonstrate the fix.
- Combine technical ingenuity with **a deep understanding of human behaviour**. Strong ideas make trust **visible and explainable**, never a black box.
- The questions behind the challenge: *What is reliable? What is current? What applies in this context? Where are the gaps? Who has relevant expertise? Which answer should a person trust?*

---

## 2. Company context: who is SD Worx

Tagline: **"We are the backbone of European work."** → [Slide 01](#slide-01), [Slide 02](#slide-02)

| Metric | Value |
|---|---|
| Experience | 80+ years |
| Employees | 10,000+ |
| Customers | 100,000+ |
| Payslips | 6M+ |
| Revenue | €1.3B (year and growth figure unreadable) |
| Payroll reach | 100+ countries (operations span Europe) |
| "Local expertise" | 30 (label unclear on the slide) |
| Own payroll engines | 20 |
| Own HCM solutions | 17 |
| Own WFM solutions | 17 |
| "SAP/EAP…" | 14 (label hidden) |

*Figures confirmed by the official brief: 80+ years, 10,000+ employees, 100,000+ customers, 6M+ payslips, payroll reach into 100+ countries.*

**Why this matters for the problem:** payroll reach into 100+ countries, 20 payroll engines and dozens of HR/time solutions mean a huge volume of rules, procedures and expertise that differ per country, per client and per product. As the brief puts it, that scale creates a wealth of expertise and also makes knowledge harder to navigate.

### The speaker → [Slide 03](#slide-03)
- *"I'll just stay for one year"*, started 2010, 6 roles over 16 years.
- Motto: *"Work hard but make it fun & authentic."*
- His own career (many roles, many handovers) is the lens for the handover example in [Section 5](#5-real-life-examples).

---

## 3. The product: mysdworx

One platform with three pillars: **HR, Pay, Time.** → [Slide 04](#slide-04), [Slide 05](#slide-05)

| HR | Pay | Time |
|---|---|---|
| Employee records | Payroll configuration | Absences and entitlements |
| Employee master data | Payroll input | Employees and contracts (?) |
| Position and organisation | Payroll processing | Clocking |
| Leave and absence | Mandatory payroll declarations | Counters |
| Documents | Mandatory payroll output | Overtime rules (?) |
| HR reporting | Payroll reporting | Workforce management reporting |
| Performance | Compensation & benefits | Advanced time |
| Skills and competences | Payments | Basic planning |
| Recruitment | 3rd-party declarations | Advanced planning |
| Travel and expense | Budgeting | Insight and data |
| Learning and development | Reward | Advanced … (?) |

**Relevance:** each module, per country, carries its own configuration knowledge, legal rules and client-specific quirks. This is the knowledge that consultants must find and trust.

---

## 4. The problem: knowledge spread everywhere

> **"A wealth of knowledge, spread everywhere"** → [Slide 06](#slide-06)

| Source | Examples | Typical weakness |
|---|---|---|
| **Documents** | Policies, manuals, procedures, checklists, analyses | Multiple versions, outdated, no clear owner |
| **Collaboration tools** | Chats, MS Teams channels, emails, shared files | Informal, unstructured, hard to find, often contradicts documents |
| **Business applications** | Operational data, workflows, exports/imports | Siloed per system, no context |
| **Teams and experts** | "What's in our heads", undocumented information | Lost when people move roles or leave |

Old and new material coexist, so volume is not the issue. **Reliability and findability are.**

---

## 5. Real-life examples

→ [Slide 07](#slide-07), [Slide 08](#slide-08)

### Example A: the urgent customer question (a Trust / Detect problem)
1. An urgent customer question arrives; the employee needs a reliable answer **now**.
2. The **AI assistant finds 3 documents**:
   - one **without an owner**
   - one that **has been edited recently**
   - one that **may apply to another country**
3. Then a colleague points to an **MS Teams chat with different information**.

**Pain:** the AI retrieves, but the employee still cannot tell which source is authoritative, current and applicable. Retrieval works; **trust fails**.

### Example B: the client handover (a Capture / Connect problem)
A payroll consultant receives a new client in their portfolio from a colleague.
- **2010:** one document for knowledge sharing + a one-hour talk with the colleague.
- **2026:** "…" (left open on purpose: the process has barely improved).

**Pain:** tacit client knowledge (history, exceptions, decisions, contacts) lives in people's heads and is transferred through one document and one conversation.

---

## 6. The official challenge statement

→ [Slide 09](#slide-09)

- **Question:** *How might we turn fragmented organisational knowledge into a trusted shared resource?*
- **Headline:** *Find it. Understand it. Trust it.*
- **Ask:** build a focused proof of concept that makes organisational knowledge easier to **find, trust or share**.
- **Constraint:** *choose one meaningful problem; you do not need to solve everything.*

→ Judges will likely value **depth and practicality on one sharp problem** over a broad platform vision.

---

## 7. Possible directions (given by SD Worx)

*"Use these questions as inspiration, not as a checklist."* → [Slide 10](#slide-10)

| Direction | Guiding question |
|---|---|
| **Trust** | How might people recognise whether information is relevant and reliable? |
| **Capture** | How might valuable knowledge become accessible beyond inboxes, documents and siloed teams? |
| **Detect** | How might conflicting, duplicated, missing or outdated knowledge become visible? |
| **Connect** | How might people find the right expertise when documents are not enough? |

*Wording as in the official brief.*

---

## 8. Problem analysis

### Root causes
1. **No ownership:** documents lack an accountable owner, so nobody maintains them.
2. **No freshness signal:** "recently edited" ≠ "verified correct"; age and validity are invisible.
3. **No scope metadata:** country, client, product and module applicability is not tagged, so rules for Belgium can surface for a Dutch client.
4. **Parallel truth channels:** Teams/email hold corrections and workarounds that never flow back into the official documents.
5. **Tacit knowledge:** expertise stays in people's heads and leaves with role changes (the speaker had 6 roles in 16 years).
6. **AI without judgement:** the existing assistant ranks by relevance, not by reliability, and cannot explain conflicts.

### Who suffers
- **Payroll / HR consultants:** slow, risky answers to clients.
- **Customers:** inconsistent answers, possible payroll errors (legal and financial risk).
- **New or rotating employees:** long ramp-up on inherited clients.
- **Experts:** interrupted repeatedly with the same questions.

### Why it matters
In payroll, a wrong answer means **wrong salaries, compliance breaches or fines**. Trust in knowledge is a business-critical quality issue, not a convenience.

### Success looks like
- A consultant gets **one answer with visible proof of reliability** (owner, verified date, scope) in seconds.
- Conflicts are **surfaced and resolved once**, not rediscovered by every employee.
- A client handover takes **minutes of review** instead of a one-hour talk plus guesswork.

---

## 9. Key concept: RAG (and why it is not enough)

**RAG = Retrieval-Augmented Generation.** Before answering, the AI searches a knowledge base and writes its answer from the retrieved passages, citing sources.

1. **Index:** documents, chats etc. are split into chunks and stored in a searchable (vector) database.
2. **Retrieve:** the question pulls the most relevant chunks.
3. **Generate:** the language model answers using only those chunks, with citations.

**Important:** SD Worx's AI assistant (Example A) is most likely *already* a RAG system. It found 3 documents; it just could not judge them. So:

> **RAG is the engine, not the idea.** The value lies in what we add on top: trust metadata, conflict detection, knowledge capture and expert routing.

---

## 10. Candidate solution directions

| # | Concept | Directions covered | Solves |
|---|---|---|---|
| A | **Trust layer on the AI assistant:** each answer shows owner, last verified date, country/client scope and a confidence badge; unverified or out-of-scope sources are down-ranked or flagged | Trust | Example A |
| B | **Conflict detector:** when retrieved sources disagree (e.g. Teams chat vs policy v3), the assistant shows the difference and routes it to the owner; the resolution becomes the new verified answer | Detect + Trust | Example A |
| C | **Chat-to-knowledge capture:** resolved answers from Teams threads are auto-drafted into proposed document updates for owner approval | Capture | Parallel truth channels |
| D | **Client handover brief:** auto-generated briefing from docs, tickets and chats (history, quirks, open issues, who to ask), reviewed by the outgoing consultant | Capture + Connect | Example B |
| E | **Expert finder:** "who knows this?" routing based on authorship, resolved questions and skills data (mysdworx already has *Skills and competences*) | Connect | Tacit knowledge |

**Recommended focus:** **A + B (Trust + Detect)**, which solves the speaker's main story end to end, builds on the assistant SD Worx already has, and is easy to demo.
**Alternative:** **D (Capture + Connect)** if the team prefers the handover story.

### Alignment with the official brief

| Brief asks for | Our concept (A + B) | Status |
|---|---|---|
| Treat it as a trust problem | Trust layer on every answer | ✅ |
| Show why an answer deserves confidence | Answer passport: owner, verified date, country/client scope | ✅ |
| Show where uncertainty remains | Confidence level + "what we're not sure about" line | ⚠️ add |
| Show who can help | Conflict routed to the document owner / expert | ✅ |
| Detect conflicting, duplicated, missing, outdated knowledge | Conflicts and outdated covered; duplicates and gaps ("no verified answer for this country") | ⚠️ extend |
| Start with the moment of doubt, not technology | Open the pitch with the consultant's moment of doubt; RAG only as plumbing | ⚠️ reorder |
| Focus on one role / workflow / signal | Payroll consultant answering an urgent client question | ✅ state it up front |
| Understand human behaviour | See below | ⚠️ add |
| Visible, explainable, no black box | Passport shows its reasons | ✅ |
| A proof of concept | Clickable demo of story 1: 3 docs + Teams chat → one answer with a passport | ⚠️ build |

### The human-behaviour angle (why it keeps working)
- **Owners only act when needed:** verification is triggered by a conflict or an expiry date, not a periodic chore.
- **One click to resolve:** the owner sees both versions side by side and picks or edits; the result becomes the verified answer for everyone.
- **Visible credit:** owners and experts are named on the answers they verified, which rewards sharing.
- **Honest uncertainty builds trust:** an answer that says "partly verified, check with X" is more credible than a confident black box.

### Pitch storyline (brief-aligned)
1. **The moment of doubt:** Sarah, a payroll consultant, gets an urgent client question. Three documents and a Teams chat disagree.
2. **Why it hurts:** in payroll, the wrong answer means wrong salaries or compliance issues.
3. **Our concept:** every answer carries a passport (owner, verified, scope, uncertainty, conflicts).
4. **Demo:** before (4 conflicting sources) → after (one explained answer).
5. **The loop:** the conflict goes to the owner once and is fixed for everyone.
6. **Under the hood:** RAG plus trust metadata.
7. **Why people will use it:** low effort, visible credit, honest uncertainty.

---

## 11. Open questions to ask SD Worx

- Which AI assistant / search tool is in use today, and which sources does it index (SharePoint, Teams, Confluence…)?
- Does document metadata exist (owner, review date, country)? Who maintains it?
- How many countries / languages must the concept handle?
- What is the deliverable: slides, a mock-up, a working prototype? How long is the pitch?
- What are the judging criteria (feasibility, impact, innovation, user experience)?
- Can we use sample or anonymised data for a demo?
- Are there privacy constraints on indexing Teams chats and emails (GDPR, works council)?

---

## 12. Slide index

All photos are in the `images/` folder next to this file.

### Slide 01
**SD Worx at a glance: "We are the backbone of European work"**
![Slide 01: SD Worx scale](images/01_sdworx_scale.jpg)

### Slide 02
**SD Worx at a glance (close-up of right column)**
![Slide 02: SD Worx scale close-up](images/02_sdworx_scale_closeup.jpg)

### Slide 03
**Speaker intro: "I'll just stay for one year"**
![Slide 03: Speaker intro](images/03_speaker_intro.jpg)

### Slide 04
**mysdworx: Pay, HR, Time in one platform**
![Slide 04: mysdworx platform](images/04_mysdworx_platform.jpg)

### Slide 05
**mysdworx: full module list per pillar**
![Slide 05: mysdworx modules](images/05_mysdworx_modules.jpg)

### Slide 06
**A wealth of knowledge, spread everywhere**
![Slide 06: Knowledge spread everywhere](images/06_knowledge_spread_everywhere.jpg)

### Slide 07
**Real-life examples to the problem (photo A)**
![Slide 07: Real-life examples A](images/07_real_life_examples_a.jpg)

### Slide 08
**Real-life examples to the problem (photo B, sharper right column)**
![Slide 08: Real-life examples B](images/08_real_life_examples_b.jpg)

### Slide 09
**The challenge**
![Slide 09: The challenge](images/09_the_challenge.jpg)

### Slide 10
**Possible directions: Trust, Capture, Detect, Connect**
![Slide 10: Possible directions](images/10_possible_directions.jpg)

### Slide 11
**Official challenge brief: "Find it. Understand it. Trust it."** (the authoritative text; it overrides any blurry reading above)
![Slide 11: Official challenge brief](images/11_official_brief.png)
