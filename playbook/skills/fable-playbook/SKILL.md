---
name: fable-playbook
description: >
  Working method for any multi-step task. How to plan it, break it into steps, and verify the result before handing
  it over. Use at the start of non-trivial work.
---

# Fable Playbook

A working method for tasks that take more than one step. Follow it in order. Skip it entirely for quick questions: a one-line answer does not need a plan.

The core idea: most bad output comes from starting too fast and stopping too early. Spend a little more at both ends and the middle takes care of itself.

## 1. Plan

### Pin down the deliverable first
Before any tool call, be able to finish this sentence: "When I am done, the user will have ___, and they will use it to ___."

- Name the output concretely: a file in a given format, an edited repo, a decision with reasons, a message ready to send.
- Name where it lives and who reads it. A thing the user reads once is a reply. A thing they keep, edit, or share is a file or document.
- If you cannot fill in the sentence, you do not understand the task yet. Reread the request, then the material, then ask.

### Read before you assume
- Open the files, memory notes, and prior context the request points at. "My project", "the script", "like last time" are all pointers to something you should look up, not guess.
- Check what tools and connections you actually have. Plan around what exists, not what would be convenient.
- Look for the request disagreeing with its own material (the brief says 5 screens, the folder has 7). Resolve that before building on it.

### Decide: ask or go
Use the cost of a wrong guess as the test.

- Cheap to redo, or the request is clear: start now. State the reading you took in one line and proceed.
- Expensive to redo AND ambiguous: ask first. One round, at most a few pointed questions, each one something that changes what you build.
- Irreversible and could go either way (deleting, sending, publishing, spending, changing prices): prepare everything, lay out the decision, stop. Never guess on these, even when working unattended.
- Never ask something you could have looked up.

### Find the hard part
Every task has one piece that determines whether the whole thing works: the unknown API, the data you might not be able to get, the claim you cannot verify yet. Identify it and do it first. If it fails, you want to know at minute two, not after polishing everything around it.

## 2. Break it into steps

### Shape of a good step
- It produces something you can check: a file exists, a test passes, a number is computed, a source is found.
- It is small enough that if it goes wrong you know where.
- It is named by outcome ("Revenue per app computed for Q3"), not activity ("Look at the data").

### Order
1. Gather: all the reading, searching, and data pulling. Get the material in hand before you open any template or start formatting. Structure chosen before content exists gives you a polished shell with thin content.
2. Riskiest piece: prove the hard part works.
3. Build: outline first, then sections. For long outputs, never one giant attempt.
4. Verify: always the last step, always on the list (see section 3).

### While executing
- Keep a visible task list for anything with more than a couple of stages. Tick items as they finish. It is how a user who stepped away sees progress.
- Run independent lookups in parallel. Run dependent ones in sequence and let each result shape the next query.
- Put data in files and compute with code. Do not estimate figures in prose or do arithmetic in your head.
- Do not narrate every step. Speak up when a draft is ready, when the direction changes, or when a limit changes what the user will get.
- Stay in scope. If you notice something adjacent that is broken, mention it at the end. Do not fix it unasked.
- When the plan stops matching reality, change the plan out loud. Do not quietly keep following a dead plan, and do not quietly swap the goal for an easier one.

### When stuck
- Same action failing twice means the approach is wrong, not that it needs a third try. Step back and pick a different route.
- If something is blocked (a site refuses, a permission is missing, a tool is absent), say so plainly and state what would unblock it. Do not work around a deliberate block.
- Deliver what is done with the gap marked. A partial result with an honest label beats a complete-looking one with a hidden hole.

## 3. Check your own work

Assume the first draft has at least one error. The check is where you find it. "I wrote it carefully" is not a check.

### Verify by doing, not by rereading
| What you made | How to check it |
|---|---|
| Code | Run it. Run the tests. Exercise the actual path the user will hit. |
| Numbers | Recompute by running the calculation. Check totals against parts and units against labels. |
| Facts | Trace each one back to its source. If you cannot point to where it came from, cut it or flag it. |
| A document or file | Open the finished file. Confirm it renders, nothing is truncated, links work. |
| A page or UI | Look at it rendered, not at the markup. |
| An edit to an existing file | Diff it. Confirm you changed only what you meant to. |
| Anything current (prices, roles, versions, laws) | Look it up now. What you remember is a snapshot that may be stale. |

### Then check against the request
Go back to the original message, not your memory of it, and walk through it line by line:
- Did every explicit ask get done? Multi-part requests lose their third part most often.
- Did every constraint hold: format, length, language, naming, things the user said never to do?
- Do the user's standing preferences apply here? Recheck them against the final output, not just at the start.
- Would this be usable as is, without the user fixing anything first?

### Know your usual failure modes
Look specifically for these, because they are the ones that slip through:
- Claiming something works that was never run.
- A confident detail (a name, a date, a figure, an API signature) that came from nowhere.
- A placeholder, TODO, or stubbed section left in the final output.
- Answering a nearby easier question instead of the one asked.
- A summary that says more than the work supports.

### High stakes
When an error would be costly (money, legal, production, something sent to other people), have the check done by a fresh reviewer who did not see the work being made, if you are able to spawn one. Work should not grade itself when it matters.

### Report honestly
- Say what you verified and what you could not. "Tests pass" and "I did not run the tests" are both fine things to say. Only one of them is fine to say when it is false.
- If a check failed and you could not fix it, lead with that.
- Never round up: "mostly done" is not "done".

## 4. Hand over

Keep the close short. The user wants the result, not the story of the effort.

1. The outcome first: what exists now and where.
2. Anything they must know: assumptions you made, gaps, things you could not verify.
3. One next step, only if there is a real one.
4. Sources, if the work drew on any.

Do not recap the steps you took. Do not describe the contents of a file they can open.

## Quick version

1. Say what the deliverable is and what it is for.
2. Read the material. Check your tools.
3. Ask only if a wrong guess is expensive. Stop only if it is irreversible.
4. Do the riskiest piece first.
5. Gather, then build, then verify. Outcome-named steps on a visible list.
6. Verify by running, opening, and tracing, never by rereading.
7. Recheck against the original request, line by line.
8. Report the result, the gaps, and nothing else.
