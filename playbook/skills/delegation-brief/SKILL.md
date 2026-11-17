---
name: delegation-brief
description: >
  Use when handing work to a subagent or another model (an orchestrator delegating to a worker), and when taking
  that work back. Covers what to delegate, how to write the brief, and how to check the result before accepting it.
---

# Delegation Brief

For an orchestrator that hands tasks to worker agents and owns the final result.

Two facts drive everything here:

1. **The worker starts cold.** It has not seen the conversation, the files you read, or the decisions you made. What is not in the brief does not exist for it.
2. **You stay responsible.** A worker's report is a claim, not a result. Whatever you pass on to the user is yours.

## 1. Decide whether to delegate

Delegate when the task is:
- **Bounded:** it has a clear end and a result you can check.
- **Self-contained:** it can be explained in a brief without the whole conversation.
- **Independent:** it does not need your next decision halfway through.
- **Worth the overhead:** a broad search, a long read, a mechanical change across many files, or several of these in parallel.

Do it yourself when:
- Explaining it takes longer than doing it.
- Each step depends on what the previous one found, and you are the one who knows what to look for.
- It needs judgment about what the user wants.
- It is irreversible or touches something outside the workspace (deleting, sending, publishing, pushing, spending). Workers prepare; you or the user decide.

Split before you delegate. One worker gets one outcome. "Research X and then refactor Y" is two briefs.

Run independent tasks in parallel. Two workers must never edit the same files at the same time: give each its own files or its own worktree, or run them in sequence.

## 2. Write the brief

Write it for a capable stranger. Every section below is there because workers fail without it.

```
GOAL
One or two sentences: what to produce and what it is for.

CONTEXT
What the worker needs to know that it cannot see: the relevant decisions already made,
what was already tried or ruled out, and where things live (exact paths, names, URLs).

SCOPE
In: what to touch or look at.
Out: what to leave alone, even if it looks wrong.

CONSTRAINTS
Rules that apply: conventions, tools to use or avoid, user preferences that affect this task,
read-only or allowed to edit, things never to do (commit, push, delete, install).

DONE WHEN
A checkable condition: the test passes, the list has N items each with a source,
every file matching the pattern is updated.

RETURN
The exact shape of the answer: a list, a table, a diff summary, a file path.
Always include: what you verified and how, what you could not verify, anything surprising.

IF STUCK
Stop and report what blocked you. Do not guess, do not widen the scope, do not work around it.
```

Rules for filling it in:

- **Give the why.** A worker that knows the purpose makes better small decisions than one following a bare instruction.
- **Paste, do not point.** "The error from before" means nothing to it. Include the actual error text, the actual path, the actual requirement.
- **Pass on the user's constraints.** Language, naming rules, forbidden things, style rules. The worker cannot follow preferences it never saw.
- **Say what is already known.** Otherwise it spends its effort rediscovering what you could have told it in one line.
- **Name the thoroughness.** "Quick look, three candidates" and "exhaustive, every occurrence" are different jobs. Say which.
- **Ask for evidence, not conclusions alone.** File and line for code claims, URL for facts, command and output for "it works".
- **Ask it to separate what it checked from what it assumes.**
- **Keep it short enough to be read.** A brief is half a page, not the conversation history.

Before sending, reread the brief pretending you know nothing else. If you would have to ask a question, answer it in the brief.

## 3. Take the work back

Read the full report before acting on it. Then check it; the depth of the check follows the stakes.

**Always:**
- Does it answer the brief, or a nearby easier question?
- Is the DONE WHEN condition actually met, or only said to be met?
- Did it stay inside SCOPE? For code, look at the real diff and the list of changed files.
- Did it report gaps or blockers that you now have to deal with?

**For code changes:** run the build and tests yourself, or see the output. Read the diff. Look for weakened tests, leftover debug output, and files that should not have changed.

**For research and facts:** open a sample of the sources and confirm they say what the report claims. Check every claim the final answer depends on, not a sample. Be suspicious of specifics with no source: names, numbers, dates, API signatures.

**For search results ("where is X", "does Y exist"):** a "not found" is only as good as the search. Check what was searched before you repeat it as fact.

**Higher stakes:** have a second, fresh worker verify the first one's result without showing it the first one's reasoning.

When several workers return, check that their results agree with each other before you merge them. Contradictions mean at least one is wrong; resolve them, do not average them.

## 4. When the result is not good enough

- **Small gap:** fix it yourself. Faster than another round.
- **Wrong direction:** the brief was probably unclear. Find the missing sentence, rewrite the brief, and send it again. Do not just repeat the same brief more firmly.
- **Same worker, more to do:** continue it with its context instead of starting a new one from zero.
- **Two failed rounds:** stop delegating this task. Do it yourself or split it smaller.
- **Worker was blocked:** treat the blocker as information. Decide, ask the user, or change the plan.

## 5. Report to the user

- Present one integrated result, not a bundle of worker reports.
- State what you verified yourself and what rests only on a worker's word.
- Never pass on "done" or "tests pass" that you did not see evidence for.
- Do not describe the machinery unless the user asks about it.

## Quick version

1. Delegate only bounded, self-contained, independent tasks. One outcome per worker.
2. Brief: goal, context, scope, constraints, done when, return format, what to do if stuck.
3. Paste the actual details. The worker knows nothing you did not write down.
4. Ask for evidence and for checked versus assumed.
5. Verify before accepting: the brief was answered, done is really done, scope was kept.
6. Bad result: fix the brief, not the volume.
7. You own what you pass on.
