---
name: snapshot
description: >
  Write, update or fully sync SNAPSHOT.md and its domain docs: the documents
  that answer "what does this product do right now, and how?" for anyone — the developer ("what is the free story
  limit?"), an agent writing App Store copy, or an outsider learning the app. Covers what the product does, features
  (user view and technical view), sign-in, roles and permissions, limits and gates, integrations, remote-controlled
  values and stack, each fact checked against the code with a source. Any language, any repo layout. Use after a task
  that changed a product fact (limit, price, config value, feature, sign-in, permission, integration, remote value),
  or when the user says "snapshot", "take a snapshot", "sync the snapshot", "update SNAPSHOT.md", "what does this
  app do".
---

# snapshot

The snapshot answers one question: **what is this product, right now?** It describes the product and its technical
state only. It is not a history log, not a plan and not a file map.

The code is the only source of truth. A snapshot that says "5 free stories" when the code says 10 is worse than no
snapshot, because people and agents make decisions on it. Treat a doc/code mismatch like a failing test.

## The document set

| Document | Role | Required |
|---|---|---|
| `SNAPSHOT.md` | **Hub.** What the product is, features, access, limits, integrations, stack. Links to the domain docs. At most 500 lines. | yes |
| Domain docs, e.g. `PRICING.md`, `PERMISSIONS.md`, `API.md` | **Detail for one domain.** All numbers or all mechanics of that domain in one place. | only when a domain is too large for the hub |

The project may use other names, for example `PRODUCT.md` for the hub. Use the names the project
already has. Create a domain doc only when its section would push the hub over 500 lines or needs a table of more
than about 20 rows. Typical cases: a large price and plan table, a rules engine or
processing pipeline, a large role and permission matrix, a public API.

**One fact, one place, across the whole set.** A plan price lives in PRICING.md only. The hub says "prices: see
PRICING.md §Plans", not the number. Two copies of a number drift apart, and then the set gives two answers.

## Readers

Write so that each reader gets an answer without reading the code:

| Reader | Asks | Reads |
|---|---|---|
| Developer | "What is the free story limit?" | Limits table in the hub, or the domain doc it links |
| Agent writing store or marketing copy | "What can a user do? What is free?" | What it does, the **User** lines, Limits |
| Agent changing code | "How does the import pipeline work? Where?" | the **Technical** lines, the domain docs, sources |
| Outsider | "What is this app?" | What it does, Features |

Three writing rules follow:

1. **User lines use product words, not code words.** "Read 10 stories a day for free", not "`FREE_DAILY_READS`
   gates `StoryScreen`". A copywriter must be able to use the line as it is.
2. **Technical lines carry the code words and the source.**
3. **Every fact stands alone.** One fact per row or bullet, with its number and unit, so a search for "limit" or
   "guest" finds a complete answer.

## Sources

Give every fact a source as **file + symbol**: `src/limits.ts` `FREE_DAILY_STORIES`, `src/billing/plans.ts` `PLANS.team`.
A symbol survives edits that move lines. Add a line number only for a fact that has no symbol, such as a statement
inside a function: `src/auth/guard.ts:31`. A fact without a source becomes a stale fact.

## Two modes

### Update (after a task)

Run after every task that changed a product fact. Change only the entries the task touched, in the hub or in the
domain doc that owns the fact.

Update when a task changed:
- a limit, quota, price, config constant or feature-flag value,
- a feature: added, removed, or its behavior for the user changed,
- engine or rules behavior described in a domain doc (pipeline order, formula, coupling),
- sign-in methods, roles or permissions,
- an integration: added, removed or replaced,
- a remote-config key, an env var the product reads, or a default value.

Do not update for refactors, styling, tests, dependency bumps without product effect, or internal renames.

Steps: run the code index script if it is available → read the diff of the task → find the owning entries → rewrite them from the code → update the `Synced` line of
each changed file → report the changed lines in one short list.

### Sync (full audit)

Run when the user asks for a snapshot, when no snapshot exists, or when an update finds the set far from the code.

1. **Find.** Search the repo for the hub (`SNAPSHOT.md`, or the project's own name for it) and the domain docs it
   links, case-insensitive, at any depth. Skip dependency and build folders (`node_modules`, `vendor`, `.venv`, `dist`,
   `build`, `target`, `Pods`, `ios`, `android`). If the hub is missing, create it at the repo root and say so.
2. **Read the code.** Do not trust the documents while you collect facts. If the code index script is available, run
   it first and use the codemap block to find sources. Then use the table under "Where to look".
3. **Classify** every claim:
   - **Wrong:** the doc says one thing and the code says another, and the code looks intentional.
   - **Missing:** the code has it and no doc mentions it.
   - **Gone:** a doc describes something the code no longer has.
   - **Code suspect:** the code looks like the bug, for example a value that contradicts a clear design rule.
     Report it. Do not change the doc or the code.
   - **Ambiguous:** the evidence points both ways. Report both sides. Do not change the doc.
   - **Unverified:** you could not confirm or refute it. Keep it under `## Unverified`. Do not delete what you only failed to find.
4. **Report before writing.**
   ```
   | # | Doc | Doc says | Code says | Source | Status |
   |---|---|---|---|---|---|
   | 1 | SNAPSHOT | Free users: 5 stories a day | 10 | src/limits.ts FREE_DAILY_STORIES | Wrong |
   | 2 | PRICING | Team plan $8 | $10 | src/billing/plans.ts PLANS.team | Wrong |
   | 3 | SNAPSHOT | — | AdminPanel checks 4 permissions | src/admin/AdminPanel.tsx PERMISSIONS | Missing |
   ```
   Write after the user agrees, or directly if the user asked for a sync without review.
5. **Write.** Keep each author's structure and prose where it is still correct. Restructure only when a file is
   missing or far from the format. Move a duplicated fact to its owning document and replace the copy with a link.
6. **Summarize** in one line per file: N checked, M corrected, K added, L removed, U unverified, plus every
   Code suspect and Ambiguous item.

**Large repos:** split the reading between two independent read-only agents, one that classifies the doc claims and
one that collects code evidence for the same areas. Compare their results. Where they disagree, mark the item
Ambiguous. Only the main session writes files.

## Where to look

| Fact | Where to look |
|---|---|
| Features and flows | routes, screens, pages, controllers, CLI commands, public API handlers |
| Sign-in | auth config, provider setup, session and token code, "guest" or "anonymous" paths |
| Roles and permissions | role enums, permission constants, guards, middleware, policy files, database row-level rules |
| Limits and prices | constants (`MAX_`, `LIMIT`, `FREE_`, `PRO_`, `QUOTA`, `PRICE`), config registries, entitlement checks, feature-flag reads |
| Engine and rules | the main loop or pipeline (scheduler, queue worker, reducer), formula modules, event handlers and what state each writes |
| Integrations | SDK imports, API clients, env var names (`*_API_KEY`, `*_URL`), webhook handlers |
| Remote values | remote-config reads, `process.env` / `os.environ` / `ENV[...]`, server-side flags |
| Stack | manifests and lockfiles: `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, `composer.json`, `pubspec.yaml`, `build.gradle`, `Package.swift`, `*.csproj` |
| Inventory | count with a command (`ls`, `find`, `grep -c`). Write down how you counted. |

When a value comes from outside the code, do not guess its runtime value. Write what the code does:
"free story limit comes from remote config key `free_story_limit`, default 5, `src/config.ts` `DEFAULTS`".

Never copy secret values. Name the variable, not its value.

## Hub format

```markdown
# SNAPSHOT — <product name>
> Synced: YYYY-MM-DD · <short commit hash, if git>
> Domain docs: [PRICING.md](PRICING.md) (plans, prices) · [PERMISSIONS.md](PERMISSIONS.md) (roles, permissions)

## What it does
<2–5 plain lines for an outsider: what the product is, who it is for, the main flow. No code words.>

## Features
### <Feature name>
- **User:** what a user can do, when, and why it matters — in product words
- **Technical:** how the code does it: key modules, data flow, edge cases · `src/feature/x.ts` `runFeature`

## Access
- **Sign-in:** Google, GitHub and guest · `src/auth/providers.ts` `PROVIDERS`
- **Guest:** can read stories, cannot save them · `src/auth/guard.ts:31`

| Role or component | Permissions | Source |
|---|---|---|
| `AdminPanel` | 4: `users.read`, `users.write`, `billing.read`, `audit.read` | src/admin/AdminPanel.tsx `PERMISSIONS` |

## Limits and gates
| Capability | Free | Paid | Source |
|---|---|---|---|
| Stories per day | 10 | unlimited | src/limits.ts `FREE_DAILY_STORIES` |

## Integrations
| Service | Purpose | Source |
|---|---|---|
| RevenueCat | subscriptions | src/billing/purchases.ts |

## Remote-controlled values
- `free_story_limit`: remote config, default 5 · `src/config.ts` `DEFAULTS`

## Stack
| Layer | Choice | Source |
|---|---|---|
| Framework | Expo SDK 54, React Native 0.81 | package.json |

## Constants
<!-- constants:start -->
<!-- constants:end -->

## Unverified
- <claims you could not confirm in the code>
```

Leave out a section that does not apply, for example `Access` in an app with no sign-in.
Keep 2–4 bullets per side of a feature.

## Domain doc format

```markdown
# PRICING — <product name>
> Synced: YYYY-MM-DD · <short commit hash> · Hub: [SNAPSHOT.md](SNAPSHOT.md)
> Owner of: plans, prices, seat limits. To change a value, edit the source in its row.

## <Topic>
Source: `src/billing/plans.ts` `PLANS`

| id | price / month | seats | source symbol |
|---|---|---|---|
| team | $10 | up to 20 | `PLANS.team` |
```

The header line "Owner of" lists what this document is the only place for. The hub links here instead of repeating it.

## Keep it current in a project

To make agents update the set as part of their work, add this to the project's `AGENTS.md` or `CLAUDE.md`:

```markdown
## Snapshot
After a task that changes a product fact (a limit, price or config value, a feature's user behavior, engine or
rules behavior, sign-in, roles or permissions, an integration, a remote-config key or default), update the owning
entry in SNAPSHOT.md or its domain doc with the snapshot skill (update mode). Not for refactors, styling or tests.
```

## Code index script (optional, JavaScript and TypeScript)

`scripts/code-index.js` reads the code once with the TypeScript compiler API and fills two marker blocks. No model,
no network, no git commands.

| Block | File | Content |
|---|---|---|
| `<!-- constants:start -->` … `<!-- constants:end -->` | SNAPSHOT.md | exported `UPPER_SNAKE_CASE` constants and `// @snapshot`-tagged variables: value, source, purpose |
| `<!-- codemap:start -->` … `<!-- codemap:end -->` | CODEMAP.md | file → exports index: functions, classes, types, consts, with the first comment line |

```bash
node scripts/code-index.js [project-root] [--constants] [--exports] [--only a,b] [--tagged] [--file SNAPSHOT.md] [--map CODEMAP.md]
```

- With no `--constants` or `--exports` flag, it fills every block whose markers exist. A file without markers is not written.
- It writes a block only when its content changed, so a re-run gives no git diff.
- `--only constants,config` limits the constants scan to those folders. A full scan also lists UI sizes and event names.
- `--tagged` lists only variables tagged `// @snapshot`.
- Values over 80 characters are cut with `…`. Names that look like credentials (KEY, SECRET, TOKEN, PASSWORD …) and
  long key-like strings are written as `[redacted]`.

**Use the index to find sources.** Before you read the code in step 2, search the codemap block for the symbols you
need (`FREE_`, `limit`, `quota`, `auth`, `permission`). Open only those files. The codemap entries are already in the
source format the snapshot uses: file + symbol.

**Check the constants against the snapshot.** In a sync, compare each constants row with the Limits and gates rows.
A difference is a **Wrong** row in the report.

Keep the constants block under about 40 rows in the hub. If it is longer, narrow it with `--only` or `--tagged`, or put
the markers in a domain doc and pass that file with `--file`. CODEMAP.md is a separate file and has no line limit.

It needs `typescript` installed in the project. Without it, it exits and writes nothing. In other languages, skip it.

## Rules

- **The code wins.** If a doc and the code disagree, the doc changes. If the code looks like the bug, report it.
- **One fact, one place** across the hub and the domain docs.
- **The header is the Synced line, plus the domain-doc links in the hub.** Audit notes, test counts, "uncommitted
  work" paragraphs and lists of what you corrected go in your report to the user, not in a file.
- **Present tense only.** No history words in entries: since, no longer, previously, raised from, removed, new,
  today, now, changed on, approved on, superseded. Before you save, search each file for them and rewrite each hit
  as a present-tense fact. No dates in entries.
- **No plans, status or decision logs.** Milestones, open work, "not wired yet" lists, rejected ideas and superseded
  decisions belong in the backlog or the history log.
- **One fact per bullet.** If a bullet needs more than two sentences, split it or move the detail to a domain doc.
- **`Why:` lines are allowed** for a value or a rule whose reason is not obvious from the code: one line, present
  tense, no date. "Why: guests can read but not save, so sign-up has a clear reason." Not "Why: changed in June after the March review."
  Do not add a `Why:` line to obvious values.
- **The hub has at most 500 lines.** Check with `wc -l` before you save. If it is longer, move a domain to a domain
  doc. Never cut `What it does`, `Access`, or `Limits and gates` to fit. Split a domain doc by topic when it passes
  500 lines.
- **Count, do not estimate.** Write how you counted.
- **Keep the level of certainty.** A value you only inferred is marked as inferred.
- **No secrets.** Variable names only.
- **Never write to the history log** unless the project's own rules say so.
