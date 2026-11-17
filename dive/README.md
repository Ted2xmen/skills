# dive

Read-only code inspection for Claude Code, split by when you need it.

| Skill | When | Question | You get |
|---|---|---|---|
| **vet** | before every commit, asked for by a hook | Is the staged diff lean, correct, clean, within the rules and the scope? | findings in chat, low-risk fixes applied |
| **audit** | at a milestone, optional | Does this body of work hold before we build on it? | `audits/audit-<date>.md` with **Go / No-go / Conditional** |
| **dive** | on demand | Is this slice right, through this lens? | findings in chat |

None of them edits your code on its own, except vet's fixes to the change being committed. Every finding has a
`file:line`, and every "unused" claim has a usage count.

## vet and the commit gate

vet asks five questions of the lines the staged diff adds or changes:

1. Is any of it not needed, or could it be shorter?
2. Is there an obvious bug?
3. Are there leftovers: debug logs, commented-out code, new TODOs, unused imports, stray files?
4. Does it break the project's own rules (`AGENTS.md`, `CLAUDE.md`, lint config)?
5. Does it touch files outside the change, or leak a secret?

The plugin ships a `PreToolUse` hook. When the agent runs `git commit`, the hook checks the tree about to be
committed. If that tree has not been vetted, it blocks the commit and asks the agent to run vet. The agent then:

1. spawns a fresh read-only subagent that did not write the change, with the staged diff and the five questions
2. checks each finding itself, fixes the confirmed ones (needless-code fixes only when low risk), and lists the rest
3. records the vetted tree in `.git/vet-checked` and retries the commit, which now goes through

The gate lets these through without a check:

- docs-only and lockfile-only diffs
- diffs that add fewer than `VET_MIN_LINES` lines of code (default 10)
- any commit when `VET_GATE=off` is set

It needs `jq`. Without `jq`, or on any internal error, it lets the commit through.

## audit

A defect hunt across eleven axes. They include tautological tests proven by mutation, loosened thresholds,
verification tools that test a copy of the logic instead of the real code, contract violations, persistence and
upgrade safety, deletion completeness, and regressions in the features that had to survive.

Ask: "audit the last 5 commits", "audit the payments module", "is this ready to ship".

## dive

A **scope** and a **lens**.

- **Scope:** the last piece of work, one feature or module, or the whole repo.
- **Lens:** correctness; simplify (dead code, one-caller layers, redundant state, hand-rolled built-ins); or a
  topic sweep. Built-in checklists cover analytics events, i18n, security, permissions, error handling and
  accessibility. For any other topic, it derives the checklist from your project's own rules.

Ask: "re-review the paywall work", "inspect the whole repo for analytics events", "are all strings translated", "what can I delete in the sync module".

## Install

```bash
claude plugin marketplace add Ted2xmen/skills
claude plugin install dive@ted2xmen-skills
```

Copying the skills without the plugin gives you the three skills but not the commit gate:

```bash
git clone https://github.com/Ted2xmen/skills
cp -R skills/dive/skills/* ~/.claude/skills/
```

## What it will not do

- Edit, format, install or commit, apart from vet fixing the change being committed. In an audit, a mutation used as proof is
  reverted before the run ends.
- Suggest a "simplification" that unlocks paid content, removes a purchase path, weakens typing or changes stored
  data.
- Report a number it did not compute, or an "unused" symbol it did not count.

## License

MIT
