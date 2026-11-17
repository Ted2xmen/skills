---
name: debug
description: >
  Use when something is broken: a bug, an error, a crash, a failing test, or behavior that does not match what was
  expected. Reproduce, isolate, test one hypothesis, fix the cause, confirm, then a short pre-commit check.
---

# Debug

For when something is broken. Five steps, in order.

The rule that matters most: **do not change code until you can explain the bug.** A fix made by guessing either does nothing or hides the symptom while the cause stays.

## 1. Reproduce
- Get the exact failure in front of you: the real error text, stack trace, failing test, or steps. Read the whole message, not just the first line.
- Run it yourself and watch it fail. If you cannot run it, say so and work from the evidence you have, labeled as unconfirmed.
- Write down the shortest sequence that triggers it. If it is intermittent, note how often and under what conditions.
- No reproduction means no way to know the fix worked. Do not skip this to save time.

## 2. Isolate
- Find the boundary between working and broken. Ask: what changed recently (git log, git diff, dependency bumps, config, environment)? Where does the data first go wrong?
- Halve the search space each step: comment out, bisect commits, log at the midpoint, feed a minimal input.
- Trace from the symptom backwards to the first wrong value. The line that throws is often not the line that is wrong.
- Check the boring causes before the clever ones: wrong env variable, stale cache or build, wrong branch, typo, missing await, null where a value was assumed, version mismatch.

## 3. One hypothesis
- State it in one sentence: "X happens because Y, so I expect to see Z."
- Test the prediction before fixing anything: add a log, inspect the value, write a failing test. If Z is not there, the hypothesis is wrong. Drop it and form a new one; do not bend it to fit.
- One hypothesis at a time. Changing three things at once means you will not know which one mattered.
- Two failed hypotheses in a row means you are missing information. Stop guessing and gather more: read the library source or docs, add more logging, reduce the case further.

## 4. Fix
- Fix the cause, not the symptom. Wrapping it in try/catch, adding a null check around the crash, or a retry is only a fix if you can say why the bad state is legitimate.
- Make the smallest change that removes the cause. No refactoring, renaming or cleanup in the same change.
- Never make a failing test pass by weakening or deleting it, hardcoding the expected value, or special-casing the test input.
- Remove every debug log and temporary change you added along the way.

## 5. Confirm
- Rerun the exact reproduction from step 1. It must now pass.
- Run the surrounding tests, not only the one that failed. Check the nearby paths that share the code you touched.
- Search for the same mistake elsewhere in the codebase. A bug pattern is rarely written once.
- If it makes sense, leave a test behind that would have caught it.

## When you cannot find it
Say so. Report what you reproduced, what you ruled out, your best remaining hypothesis and what would confirm it. Do not ship a speculative fix described as a solution.

## Before you commit

This skill ends where the review starts.

- **If the `vet` skill is available** (the `dive` plugin), let it check the staged diff. Do not repeat its questions here.
- **If it is not,** do the short version yourself: run `git diff` and `git status`, read every changed line, and confirm there is no debug output, no TODO or commented-out code you added, no temporary value, no unrelated file and no secret.

Either way, two checks stay with you:

1. Build, typecheck, lint and tests pass, run after your last edit, with the project's own commands. `vet` skips the test suite on purpose.
2. Every caller of anything whose signature or behavior you changed still works. Search for every usage; `vet` only looks at the code the diff reaches.

Report what you ran and what you did not. "Typecheck passes, tests not run because there is no test setup" is a good report. "Should work" is not. Commit or push only if the user asked.

## Quick version

1. Reproduce it and watch it fail.
2. Narrow down to the first wrong value.
3. One hypothesis, tested before any fix.
4. Smallest fix at the cause. Never weaken the test.
5. Rerun the reproduction and the tests around it.
6. Before commit: vet if available, otherwise read your diff. Always run build and tests after the last edit and check the callers.
