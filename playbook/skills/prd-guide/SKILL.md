---
name: prd-guide
description: >
  Use when planning a new product, SaaS or major feature and a PRD, product spec or product brief is needed. Covers
  what to find out first, the PRD structure, how to write testable requirements, and the checks before handing it over.
---

# PRD Guide

How to write a product requirements document for a new product or SaaS. A PRD answers four questions for the people
who will build it: what problem, for whom, what counts as success, and what is in and out of the first version.

A PRD states intent. It is not a design, not a technical spec and not a project plan. Say what must be true for the
user, and leave how to the people who build it, unless a constraint forces the how.

## 1. Before you write

### Get the inputs
You need these six. Take them from what the user gave you first; ask only for what is missing, in one round.

1. **Problem:** what hurts, for whom, and how they cope today.
2. **Target user:** one primary user, described by situation, not demographics.
3. **Why now and why this team:** what changed, and what advantage exists.
4. **Business goal:** what the product must achieve for its owner (revenue, retention, cost, learning).
5. **Constraints:** time, budget, team size and skills, platforms, legal or compliance limits.
6. **Stage:** an idea to test, or a decision already made to build.

If an input is missing and nobody can supply it, write it as an assumption and mark it. Do not fill the gap with a
confident guess.

### Match the depth to the stage
- **Idea being tested:** a one-page brief. Sections 1 to 4, 7 (first version only) and 11.
- **Committed build:** the full structure below.
- A long PRD for an untested idea is waste. A one-pager for a six-month build is a risk.

### Check the outside world
Anything about the market is a fact to look up, not to remember: competitors and what they charge, existing
alternatives, platform rules, legal requirements. Search for it, cite it, and date it. If you cannot verify it, say
so in the text.

## 2. Structure

Use these sections in this order. Leave out one that does not apply, and say that it was left out.

1. **Summary.** Three to five sentences: the problem, the user, the product, the first version, the success measure.
   Write it last.
2. **Problem and evidence.** The problem in the user's words. What they do today and what it costs them. The evidence:
   interviews, support requests, search demand, own data. Label evidence and assumption separately.
3. **Users.** The primary user and the job they are trying to get done. Secondary users only if the first version
   must serve them (for example the admin who pays). Who it is explicitly not for.
4. **Goals, non-goals, metrics.**
   - Goals: outcomes, not features. "Teams send an invoice in under two minutes", not "invoice editor".
   - Non-goals: things a reader would expect that this version will not do, with a one-line reason.
   - Success metrics: each with a baseline, a target, a date and how it is measured.
   - Guardrail metrics: what must not get worse (support load, churn, response time).
5. **Alternatives and positioning.** What users use today, including "nothing" and a spreadsheet. For each: what it
   does well and where it fails this user. Then one sentence on why this product wins for this user.
6. **Solution overview.** The core flow from first visit to the moment the user gets the value, as numbered steps.
   One paragraph on what makes the experience different. No screen designs.
7. **Scope and requirements.** The requirement table (see section 3), split into:
   - **Must (first version):** without it the core flow does not work.
   - **Should (soon after):** valuable, not blocking.
   - **Later:** recorded so it is not rediscovered.
   - **Out of scope:** will not be built, with the reason.
8. **Business model and SaaS basics.** Fill each line or mark it "not in first version".
   - Accounts: sign-up and sign-in methods, single user or organizations, invitations.
   - Roles and permissions: who can see and do what.
   - Plans and pricing: plans, prices, billing period, what each plan limits, free tier or trial and its end.
   - Billing: payment provider, upgrades and downgrades, failed payments, refunds, invoices, taxes.
   - Onboarding and activation: the first-session steps and the event that counts as "activated".
   - Data: what is stored, where, who owns it, export, deletion, retention.
   - Privacy and compliance: personal data handled, consent, the regulations that apply.
   - Integrations: third-party services the first version depends on.
   - Notifications: emails and alerts the product sends, and when.
   - Support and admin: how users get help, what the owner must be able to see and fix.
9. **Quality requirements.** Performance targets, availability, security, accessibility, languages and regions,
   supported devices and browsers. Numbers, not adjectives.
10. **Measurement.** The events and properties needed to compute every metric in section 4. A metric with no event
    cannot be measured after launch.
11. **Risks and assumptions.** Each one with: how likely, what it would cost, and the cheapest test that would settle
    it. Put the riskiest assumption first; the first version should exist to test it.
12. **Release plan.** Milestones by outcome, launch criteria (what must be true to ship), and stop criteria (what
    result means stop or change direction).
13. **Open questions.** Each with an owner and a date. A question nobody owns stays open.

## 3. Writing requirements

One requirement per row:

| ID | Requirement | Priority | Acceptance criteria |
|---|---|---|---|
| R1 | A member can invite a teammate by email. | Must | Given a member on a paid plan, when they enter a valid email, then the teammate receives an invite that is valid for 7 days. |

Rules:
- **One behavior per requirement.** "And" in a requirement usually means two requirements.
- **State the behavior, not the implementation.** "The user can undo a delete for 30 days", not "soft-delete column".
- **Every requirement is testable.** If you cannot write its acceptance criteria, it is not a requirement yet.
- **Cover the unhappy path.** Empty state, error, no permission, limit reached, offline or timeout, cancelled payment.
- **Numbers carry units and limits.** "Up to 20 seats", "within 2 seconds at the 95th percentile".
- **Every Must traces to a goal.** If it serves no goal in section 4, move it down or cut it.
- **Stable IDs.** Never renumber; later documents refer to them.

Cutting scope is the main work. For each Must, ask: if this were missing, could the primary user still reach the
value in section 6? If yes, it is a Should.

## 4. Language

- Plain words, short sentences, present tense. "The user can", "The system sends".
- One name per thing, used everywhere. Define a term once in the text where it first appears.
- No adjectives standing in for numbers: fast, simple, scalable, intuitive, seamless.
- Mark every unverified statement where it stands: `ASSUMPTION:` or `UNVERIFIED:`.
- Decisions are written as decisions, with the reason and the date. Options still open go to section 13.

## 5. Check before handing over

- [ ] A reader new to the project can say what is being built, for whom and why after the summary alone.
- [ ] The problem section has evidence, and evidence is separated from assumption.
- [ ] There is one primary user.
- [ ] Every goal has a metric with baseline, target and date, and section 10 has the events to measure it.
- [ ] Non-goals and out-of-scope are filled in, not empty.
- [ ] Every Must has acceptance criteria and traces to a goal.
- [ ] Unhappy paths are covered for the core flow.
- [ ] Section 8 has no silent gaps: each line is filled or marked "not in first version".
- [ ] Market and competitor facts have a source and a date, or are marked unverified.
- [ ] The riskiest assumption is named and the first version tests it.
- [ ] Open questions have owners.
- [ ] No requirement prescribes implementation without a stated constraint.

## Common failures

- A feature list with no problem statement.
- "Everyone" as the target user.
- Goals that are features, metrics with no baseline.
- A first version that contains everything.
- Invented market sizes and competitor details.
- Pricing, billing, permissions and data deletion left for later and discovered during the build.
- Requirements that cannot be tested.

## Output

Deliver one document, named `PRD.md` unless the project has its own convention. Put the summary and the open
questions where the reader sees them first. After the PRD, say in a few lines which assumptions carry the most risk
and which questions block the start of work.
