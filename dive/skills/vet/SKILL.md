---
name: vet
description: >
  Pre-commit check of the staged diff by a fresh read-only subagent that did not write it. Five questions, asked only
  of the lines the diff adds or changes: is any of it not needed or could it be shorter; is there an obvious bug; are
  there leftovers (debug logs, commented-out code, new TODOs, unused imports, stray files); does it break the
  project's own rules; does it touch files outside the change or leak a secret. The plugin's commit hook asks for it
  before every commit that adds real code. Use when the commit gate asks for it, or when the user says "vet this",
  "check before I commit", "pre-commit check", "look over the staged diff".
---

# vet

A fast check of what is about to be committed. It looks only at the staged diff and the code that diff calls into.
For a deeper look at a module or the repo use `dive`; for a milestone go/no-go use `audit`.

## The five questions

Ask them of the lines the diff adds or changes, in this order.

1. **Needless code.** Could the same change be done with less?
   - a new helper, hook, service, wrapper or type with one caller that only forwards to something else
   - state that could be computed from other state; an effect that syncs nothing external
   - logic that already exists elsewhere in the repo, or a hand-written version of a built-in API
   - fallbacks and checks for cases the types or the callers already rule out
   - code for a future need with no caller today
2. **Obvious bugs.** Wrong conditions, off-by-one, unhandled empty or null input, a swallowed error, an `await`
   missing, a flag or lock not reset in `finally`, a changed signature with an unchanged caller.
3. **Leftovers.** Debug logging, commented-out code, new `TODO` / `FIXME` without an owner, unused imports or
   variables, `skip` / `only` in tests, temporary files, hardcoded test values.
4. **Project rules.** The rules the repo sets for itself in `AGENTS.md`, `CLAUDE.md`, a contributing guide or lint
   config. A broken house rule is a finding; quote the rule.
5. **Scope and leaks.** Staged files that do not belong to this change (unrelated edits, asset deletions, generated
   output). Secrets, tokens, private keys or personal data in the diff.

Do not report style, naming taste or formatting. Do not review code the diff does not touch.

## Steps

1. **Collect.** `git diff --cached` and `git diff --cached --stat`. Read the project's rule files once.
2. **Spawn a fresh subagent.** It must not be the agent that wrote the change: an author defends its own code. Give
   it read-only tools, the diff, the staged file list, the rule files' paths, and this brief:

   > You did not write this diff. Ask the five questions in the vet skill of the lines it adds or changes, plus the
   > code they call into. For each finding give: question number, `file:line`, what is wrong, the fix as a short
   > sketch, and the risk of the fix (Low / Medium / High). Every "unused", "duplicate" or "single caller" claim
   > needs a search with a real count. Cite a secret by `file:line` and type, never its value. If the diff is
   > clean, say so in one line. Do not edit files.

3. **Check each finding yourself.** Open the cited lines. A subagent's claim is a lead, not a fact.
4. **Act.**
   - Fix bugs (2), leftovers (3), rule breaks (4) and leaks (5) that you confirmed.
   - Apply needless-code findings (1) only when the fix is Low risk and keeps behavior identical.
   - Unstage files that do not belong to the change, and tell the user which.
   - Report what you did not fix in one short list: finding, why you left it, what would settle it.
5. **Record the check and commit.** Re-stage, write the tree hash to the marker, retry the commit:

   ```bash
   git add <files>                                   # or: git add -u
   git write-tree > "$(git rev-parse --absolute-git-dir)/vet-checked"
   git commit ...
   ```

   If your fixes only removed or corrected lines the subagent pointed at, record the new tree without another
   round. If you wrote new logic while fixing, vet again what changed. Stage in its own command, not chained with
   the commit: the gate reads the index as it stands when the commit command starts.

## Rules

- **Money and trust paths stay intact.** No fix may unlock paid content, remove a purchase or restore path,
  misreport an analytics event, weaken typing or change a persisted data shape.
- **Count before you claim.** Watch what a plain search misses: dynamic imports, file-based routes, config plugins,
  string-keyed registries, generated code.
- **Keep it cheap.** No full test suite, no repo-wide sweep. If the diff shows a problem bigger than the diff, say so
  in one line and suggest `dive` or `audit`.

## Report (in chat)

```
vet: 3 findings, 2 fixed, 1 left
[2] FIXED  src/sync.ts:88  isSyncing not reset when fetch throws → moved to finally
[3] FIXED  src/sync.ts:12  console.log left in
[1] LEFT   src/useThing.ts:5  one-caller hook; inlining touches the purchase screen, risk Medium
Unstaged: assets/old-logo.png (not part of this change)
```

## The gate

The plugin's hook blocks a `git commit` while the tree about to be committed has not been vetted. It lets the
commit through for docs-only and lockfile-only diffs and for diffs under `VET_MIN_LINES` added lines of code
(default 10). `VET_GATE=off` turns it off.
