---
name: dive
description: >
  On-demand, read-only inspection of one slice of a codebase through one lens. Scope: the last piece of work, one
  feature or module, or the whole repo. Lens: correctness (does it do what it should, safely), simplify (could the
  same behavior come from less code: dead code, one-caller layers, redundant state, hand-rolled built-ins), or a
  topic sweep (analytics events, i18n, security, permissions, error handling, accessibility, or any topic the user
  names). Findings ranked P0–P3 with file:line and a failure scenario. Never edits code. Use when the user says
  "re-review the paywall work", "review this PR", "check the last commits", "inspect the whole repo for analytics
  events", "are all strings translated", "what can I delete", "simplify the sync module", "is this overbuilt".
  For the pre-commit check use vet; for a milestone go/no-go use audit.
---

# dive

You inspect work you did not write. Assume its authors were capable, tired and sure they were done.

Every request is a **scope** and a **lens**. Read both from the request. If either is unclear, state your reading in
one line and continue.

## Scope

| Scope | Example | How to collect it |
|---|---|---|
| **last work** | "re-review the paywall work", "check the last 3 commits", a PR or branch | `git log --oneline` to find the commits, then `git diff BASE..HEAD`; add the dirty working tree when there is one |
| **feature or module** | "the sync module", "onboarding" | every file of the feature, its tests, and its callers (search for its exports) |
| **whole repo** | "the whole repo" | the repo from its entry points outward; split by area across parallel read-only subagents |

For a feature, find its files by search, not by folder name alone: features leak into shared helpers, config and
routes. List the files you settled on in the report.

## Lens

### correctness

Does the code do what it should, and is it safe?

1. **Intent.** Write down the expected behavior from the request, the spec or the tests. Without it, say so and
   review against the most plausible intent.
2. **Logic.** Wrong conditions, off-by-one, edge inputs (empty, null, huge, negative, unicode), ordering, races,
   double execution, lost updates.
3. **Error paths.** What happens on failure, timeout, offline, cancel, retry. Swallowed errors. Unreset flags and
   locks (no `finally`).
4. **Contracts.** API, schema, config, event or storage changes that break a caller or a stored record.
5. **Security.** Auth checks, secrets, input validation, injection, permissions.
6. **Project rules.** The rules the repo sets for itself (`AGENTS.md`, `CLAUDE.md`, contributing guide, lint
   config). A broken house rule is a finding.
7. **Claims against code.** Does the commit message, PR text or doc match what the code does? Look for leftovers of
   bulk edits, half-merged blocks, and files the author says changed that git does not show.
8. **Test gaps.** High-risk paths with no test.

### simplify

Could the same behavior come from less code? Follow [references/simplify.md](references/simplify.md): its steps, its
catalog and its finding shape.

### topic sweep

Is one cross-cutting concern handled right everywhere in the scope?

1. **Build the checklist first.** Read the project's own rules for the topic (docs, lint rules, an event catalog,
   a locale setup, a permissions matrix). Add the generic checks below. Write the checklist at the top of the
   report so the reader sees what was checked.
2. **Inventory.** Find every place the topic appears, with a search and a count. Find the places it should appear
   and does not (a screen without its view event, a string literal outside the locale files).
3. **Check each place** against the checklist.

Generic checks per common topic. For a topic not listed, derive the checklist from the project's own rules and the
platform docs, and say that you did.

| Topic | Check |
|---|---|
| analytics events | every event in the catalog is fired, every fired event is in the catalog; names and property keys follow one convention; required properties present; no PII; fires once per action (not on re-render or retry); money and conversion events fire only after confirmation |
| i18n | no user-facing literal outside locale files; every key exists in every locale; placeholders and plurals match across locales; no string concatenation of translated parts; dates, numbers and currency go through the locale formatter |
| security | secrets not in source or logs; input validated at the boundary; no query, command or path built from raw input; authorization checked on every protected path, server side |
| permissions | asked in context, not at launch; denial handled with a path forward; status re-read when the app returns; usage strings present for every permission requested |
| error handling | no empty `catch`; user sees a recoverable state; errors reported once; retries bounded and idempotent |
| accessibility | labels on icon-only controls; touch targets at platform minimum; dynamic type does not clip; contrast; focus order |

## Rules

1. **Read-only.** Edit, format, install or commit nothing. Give fixes as short suggested diffs. Write a report file
   only for a whole-repo scope or when the user asks: `audits/dive-<lens>-<topic>-YYYY-MM-DD.md`.
2. **Hands off money and trust paths.** No proposed fix may unlock paid content, remove a purchase or restore path,
   misreport an analytics event, weaken typing or change a persisted data shape.
3. **The code wins.** Specs state intent. READMEs, changelogs and code maps are claims; check them against the code.
4. **Run what the project has** (type check, lint, tests) when the lens is correctness, with commands read from the
   manifest. A red gate is a finding.
5. **Evidence or no finding.** Every finding has `file:line`. Every "missing" or "unused" claim has a search and a
   count. Watch what a plain search misses: dynamic imports, file-based routes, string-keyed registries, generated
   code.
6. **Prove the important ones.** Where it is cheap, show the bug with a throwaway test or a quick run, then remove
   it. Proven: **CONFIRMED**. Otherwise: **PLAUSIBLE**.
7. **Subagent output is a lead.** Open every cited line yourself before it enters the report.
8. **Severity:** **P0** outage, data loss, money loss, exploitable · **P1** likely breakage · **P2** moderate
   cost · **P3** minor.
9. **Stay in scope and lens.** Something serious outside them goes in one line under "outside scope", not in the
   findings.
10. **Secrets:** cite `file:line` and the credential type, never the value.

## Report

1. **Verdict** in one line: "clean", or the count of findings by severity and the worst one.
2. **Scope and lens:** the files or commits inspected, the checklist used, the commands run.
3. **Findings**, most severe first:
   `[P1] CONFIRMED · path/file.ts:42 · scenario (inputs and state → wrong outcome) · fix direction`
4. **Checked and sound:** what you checked and found right, so the next run does not redo it.
5. **Open questions** that need a human, and what would settle each.
6. **Confidence** 1–10. Below 8, name the missing evidence.
7. A closing line saying no repo file changed except the report, if one was written.
