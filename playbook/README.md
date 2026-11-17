# playbook

Four Claude Code skills that write down a working method, so an agent follows the same steps
every time.

| Skill | When it loads | What it covers |
|---|---|---|
| `fable-playbook` | At the start of any multi-step task | Pin down the deliverable, decide whether to ask or start, do the riskiest piece first, verify by running and tracing, report the result and the gaps. |
| `debug` | When something is broken: a bug, an error, a crash, a failing test | Reproduce, isolate, one hypothesis, fix the cause, confirm. Ends with a short pre-commit check that hands the diff to `vet` when it is installed. |
| `delegation-brief` | When handing work to a subagent or another model, and when taking it back | When to delegate, a brief template (goal, context, scope, constraints, done when, return, if stuck), and how to check the result before accepting it. |
| `prd-guide` | When planning a new product, SaaS or major feature | What to find out first, a 13-section PRD structure with the SaaS basics (accounts, plans, billing, data), rules for testable requirements, and a final checklist. |

All four are plain instructions: no scripts, no hooks, any language and any repo.

## Install

As a plugin:

```bash
claude plugin marketplace add Ted2xmen/skills
claude plugin install playbook@ted2xmen-skills
```

Or copy the skills:

```bash
git clone https://github.com/Ted2xmen/skills
cp -R skills/playbook/skills/fable-playbook ~/.claude/skills/
cp -R skills/playbook/skills/debug ~/.claude/skills/
cp -R skills/playbook/skills/delegation-brief ~/.claude/skills/
cp -R skills/playbook/skills/prd-guide ~/.claude/skills/
```

## Use

The skills load on their own when the task matches. To ask for one directly:

```
use the fable playbook for this
debug this failing test
write a delegation brief for this task
write a PRD for this product idea
```

## Next to dive

The two plugins split by role. `playbook` is the author's side: how to do the work. `dive` is the reviewer's side:
an independent check of work already done. It is read-only, except that vet fixes what it confirms in the change
being committed.

`debug` does not review the diff itself. Before a commit it hands over to `dive`'s **vet**, and keeps two checks for the
author. Running the build and tests after the last edit, which vet leaves out on purpose. And searching every usage
of anything whose signature or behavior changed, where vet only looks at the code the diff reaches. Without `dive` installed, `debug` falls back to a short self-check of the diff.

## License

MIT
