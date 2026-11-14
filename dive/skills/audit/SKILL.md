---
name: audit
description: >
  Deep, independent, adversarial audit of a body of work before anyone builds on it: the last commits, a commit
  range, a module or a milestone. Eleven axes (tautological tests proven by mutation, loosened criteria, honesty of
  verification tools, contract and boundary violations, purity, logic against the spec, persistence and upgrade
  safety, runtime reality, security, deletion completeness, regressions in survivors). Writes
  audits/audit-YYYY-MM-DD.md with a Go / No-go / Conditional verdict. Never edits code. Use when the user says
  "audit the last commits", "audit this milestone", "is this ready to ship", "can we build on this", "go or no-go".
---

# audit

A defect hunt at a milestone, not an improvement round. You did not write this code and you trust none of it. Prove
or disprove that the foundation holds. If you find nothing, prove that too.

Output: `audits/audit-YYYY-MM-DD.md`. Verdict: **Go / No-go / Conditional**.

## Rules

1. **Read-only.** Edit, format, install, migrate or commit nothing. The only file you write is the report. A
   mutation made as proof is reverted, and the run ends with a clean `git status --porcelain` apart from the report.
2. **The code wins.** A binding spec (PRD, RFC, ADR, `spec/`) states intended behavior. READMEs, changelogs, code
   maps and wikis are claims: check each against the code before it enters the report. Read the project's own rules
   first (`AGENTS.md`, `CLAUDE.md`, lint config) and audit against them.
3. **Run the tools.** Type check, lint, tests and build, with the commands read from the manifest. A red gate is a
   finding. Paste real output.
4. **Evidence or no finding.** Every finding has `file:line`. Every "unused" or "missing" claim has a search and a
   count. A proven finding is **CONFIRMED**; one without proof is **PLAUSIBLE**.
5. **Severity:** **P0** outage, data loss, money loss, exploitable · **P1** likely breakage · **P2** moderate
   correctness or maintenance cost · **P3** minor. Each finding gets a failure scenario (inputs and state → wrong
   outcome) and a fix direction.
6. **Compute, do not estimate.** Every number in the report comes from a command (`node -e`, `python3 -c`) whose
   output you paste.
7. **Secrets:** cite `file:line` and the credential type, never the value.

## 0. Set up the scope yourself

**Scope** comes from the request. It can be any of these.

| Scope | How to read it |
|---|---|
| Base commit | `git log --oneline BASE..HEAD` and `git diff BASE..HEAD` |
| Commit range | `git log --oneline A..B` and `git diff A..B` |
| Module or directory | every file under it, plus its tests and callers |
| Phase or milestone | the commits and files that the plan or changelog ties to it, verified against git |

If the scope is empty, infer the last completed unit of work from `git log` and the working tree. State the inferred
scope in the first lines of the report.

The uncommitted working tree is in scope when it is dirty. Run `git status` first. Bugs in uncommitted work are the
cheapest to fix.

Before the first axis, record these facts. Measure them, do not guess them.

1. **Stack and commands:** package manager, test runner, type check, lint, build. Read them from the manifest.
2. **Change set:** `git log --oneline -20`, `git status --porcelain`, `git diff --stat` for the scope.
3. **Inventory:** file count, line count, test count, from `git ls-files` and `wc -l`.
4. **Spec sources:** a binding spec (PRD, RFC, ADR, `spec/`, behavior contracts in docs) if one exists. Without one,
   the spec is the tests and the explicit promises in the README. Say which applies.
5. **Context of the range:** the commit messages and any plan that describes the work. Treat them as context, not
   as truth.

## Axes

Treat each axis independently. Skip an axis that does not fit the scope, and give the reason in one sentence. Within
each axis, read the spec first, then the code, then measure the gap. Every axis ends with a verdict: **CLEAN**,
**FINDINGS** or **SKIPPED (reason)**.

### 1. Tautology hunt (highest priority)

How many tests verify real behavior, and how many prove themselves?

- Assertions that compute the expected value with the same formula the code under test uses. Pattern:
  `expect(f(x)).toBe(<copy of f's body>)`. Such a test verifies nothing.
- Expectations derived from constants or config. Separate the legitimate ones (fixed formula, varying data) from the
  tautological ones.
- Weak assertions: `toBeDefined()`, `toBeTruthy()`, `not.toThrow()`, unreviewed snapshots, empty `expect` bodies,
  and their equivalents in other test frameworks.
- Tests that can never fail: a mock's own return value asserted back, `if` branches never entered, async assertions
  without `await`, leftover `skip` or `only` markers.
- Critical paths with no test: error branches, boundary values, concurrency, idempotency.

**Proof required.** For every test you call tautological, run a mutation test. Break the code on purpose, show that
the test still passes, then revert the break. If you cannot produce a surviving mutation, withdraw the claim.

### 2. Loosened-criteria hunt

Was a threshold, criterion, tolerance or acceptance condition loosened during the project? Search with `git log -S`
for threshold values and read the commit messages.

For each loosening, answer these questions.

1. Is the stated reason mathematically or empirically correct? Do the derivation yourself and run the arithmetic.
2. Were the rejected alternatives actually tried, or rejected untried?
3. **The real question:** is the new criterion meaningful, or is it "the range the current numbers happen to pass"?
   If it is a cover-up, say so plainly.

Apply the same suspicion to loosened type checks (`any`, `@ts-ignore`, `# type: ignore`, `//nolint`), disabled lint
rules, deleted or skipped tests and lowered coverage thresholds.

### 3. Honesty of verification tools

Check every mechanism that claims to verify the code: simulations, benchmarks, integration harnesses, end-to-end
suites, fixture generators.

- Does it import and call the real production functions, or does it run a parallel copy of the logic? A copy does not
  verify production code. Every claim that rests on it falls.
- Do its metrics match the spec's definitions exactly? Is a metric defined so that it passes easily?
- Are the inputs or policies too optimistic (perfect network, zero latency, ideal user behavior)? Do the targets pass
  only because of that?
- **Determinism:** does the same input or seed give the same result twice? Run it twice yourself and compare.

### 4. Boundary and contract violations

Find the architecture rules the project sets for itself (`AGENTS.md`, `CLAUDE.md`, spec, lint config, folder
conventions). Then hunt violations of them.

- **Contract compliance:** if the project has written behavior contracts, give each clause a verdict against the
  current code with `file:line` proof. Check that code, contract text, summaries and docs agree with each other.
  Verify a doc that changed in the scope against the code, not the other way around.
- **Layer leaks:** a lower layer importing an upper one (UI or framework code in the domain layer, database or
  network calls in a pure module).
- **Scattered constants:** magic numbers and strings in production code instead of one config or constants source.
  Check that technical constants and domain constants are kept apart.
- **Dependency direction:** circular imports, forbidden imports, config importing config.
- **Hand-written derivable data:** tables, cumulative values or denormalized fields that should be a formula.
- **Dead validation:** a schema or validator layer that exists but is never called. Show the call site with a search.
- **Rule sweep of the full diff:** new escape hatches from the type system (`any`, non-null assertions, unchecked
  casts), missing explicit types where the project requires them, hardcoded names where the project defines
  constants, async flags or locks not reset in a `finally` block, new magic values.

### 5. Determinism, purity and side effects

- Clock, randomness, ID generation and environment reads (`Date.now()`, `Math.random()`, `uuid()`, `process.env` and
  their equivalents) inside layers that must stay pure. Are they gathered behind one injectable source?
- Global mutable state, module-level singletons, behavior that depends on import order.
- Seeded randomness: does the same seed give the same sequence? Does the state survive persist and restore?
- I/O order, retries and timeouts: does a retry apply a side effect twice?

### 6. Logic against the spec, line by line

For every critical function in scope, read the spec section, read the code, write down the gap.

- **Order of operations:** if the spec defines a canonical order, does the code follow it exactly?
- **Combination rules:** additive or multiplicative, precedence, clamps. Can a cap be exceeded?
- **Time and segment logic:** double counting or loss at event points. Check the boundary moments: t=0, exact
  equality, negative elapsed time.
- **State transitions:** check every field in the transition table, field by field. Resetting a field that must
  survive is a silent disaster.
- **Idempotency:** the same operation or transaction ID twice must take effect once.
- **Error paths:** unexpected input, null, empty collections, very large numbers, overflow.
- **Re-derived journeys:** where behavior depends on user state over time (counters, meters, prompts, gates,
  schedules), recompute the outcomes per user segment yourself from the code. Do not trust the test expectations.
  Check the tests against your own numbers. Put the derived tables in the report, even when they confirm the code.

### 7. Persistence, serialization and migration

- Does the list of fields written to disk or database match the list that should be written? Do volatile or derived
  fields leak into storage?
- Is the round trip lossless? Test the edge values: very large numbers, `Infinity`, `NaN`, unicode, `null`, empty
  objects.
- **Migration chain:** missing fields filled, unknown records cleaned, data from a newer version left untouched. Are
  these tested, or do they only exist as code?
- **Upgrade safety:** an install of the previous release opens this build. Every persisted key still parses (schemas
  only widened). Retired keys are marked and clearable. Jobs, notifications or timers scheduled by removed features
  get cancelled. A user halfway through a multi-step flow resumes correctly.
- **Corrupt data recovery:** look for silent data loss or automatic resets. Usually neither is acceptable.
- **Write triggers and concurrency:** are all write triggers present? Is a concurrent write blocked (in-flight
  guard, lock)? What happens on an interruption (kill, backgrounding, crash) mid-write?

### 8. Runtime and integration reality

- Did the code actually run, or does it live only in the test environment? Does a dependency that tests mock
  silently fail in production?
- Do the dependency versions match the documentation of the framework or SDK **at that version**? Read the version
  from the manifest or lock file. Hunt unverified API use. If the project points to versioned docs, read them.
- Does anything break on the startup path? Run it if you can.
- Performance: obvious O(n²) work, I/O inside loops, needless recomputation or re-rendering.

### 9. Security and data hygiene

- Leaked secrets, PII written to logs, unvalidated external input, injection surface, paths that skip authorization.
- Queries, commands or file paths built directly from user input.

### 10. Deletion completeness

For every feature, flag or code path removed in the scope, search for orphans: dead translation keys, dead event or
constant names, dead types, stale comments and docs, tests that assert deleted behavior, persisted keys not marked
as retired. Give a count per search.

### 11. Regression hunt on survivors

List the features that had to survive the changes in scope: neighbors of deleted code, shared helpers, features the
plan said to keep untouched. Prove each one still works by reading its current code path end to end. Read the code,
not the diff.

## Method

- Split the axes across parallel read-only agents on a large scope. Verify every agent finding yourself before it
  enters the report.
- Change no file permanently. Revert every mutation-test break. End with the output of `git status --porcelain`
  and show it is clean apart from the report.
- Write fix suggestions. Do not apply them.

## Report format

Write these sections in this order.

1. **Verdict:** **Go / No-go / Conditional**, with a one-sentence reason. For No-go or Conditional, list the
   blockers or the conditions.
2. **Scope:** what you audited, what you did not, the base or range, the inferred scope if the request was empty,
   and the commands you ran.
3. **Axis verdicts:** one table row per axis with CLEAN, FINDINGS or SKIPPED and the reason.
4. **Critical findings:** they break the foundation and must be fixed before work continues. Each one gives
   `file:line`, what is wrong, how you proved it, and what to do.
5. **Important findings:** fix them, but they do not block.
6. **Minor findings and cleanup.**
7. **Tautology report:** tests inspected, tests found weak or tautological, and the mutation proof for each.
8. **Loosened-criteria verdict** (if any): legitimate or cover-up, with your own derivation.
9. **Derived tables:** your independent journey and segment math.
10. **Verified as sound:** what you checked and found solid. Knowing what was audited has value.
11. **Command output:** the real output of every command you ran, ending with a clean `git status --porcelain`.

No length limit. Long and proven beats short and wrong.
