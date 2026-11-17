# snapshot

A Claude Code skill that writes and syncs `SNAPSHOT.md`: a technical picture of what a codebase does **right now**.

> This app lets teams share boards. Sign-in: Google, GitHub and guest. `AdminPanel` checks 4 permissions.
> Free users get 10 exports a day. Stripe handles subscriptions.

Every line is checked against the code and carries a source (file + symbol).
Large domains get their own document, for example `PRICING.md` for plans and prices or `PERMISSIONS.md` for a role
matrix. `SNAPSHOT.md` stays the hub (at most 500 lines) and links to them. Each fact lives in one place.
Before it changes the file, the skill shows a table of what was wrong, missing, gone or unverified.

Works in any language and any repo layout.

## What the snapshot covers

- what the product does and its main flow
- stack, read from manifests and lockfiles
- features: what a user can do, and how the code does it
- sign-in methods, roles and permissions
- limits, quotas, feature gates
- integrations
- values controlled from outside the code (remote config, env vars)
- an optional constants table and code index, generated without a model (JS/TS)

It does not keep history and it is not a file map.

## Install

As a plugin:

```bash
claude plugin marketplace add Ted2xmen/skills
claude plugin install snapshot@ted2xmen-skills
```

Or copy the skill:

```bash
git clone https://github.com/Ted2xmen/skills
cp -R skills/snapshot/skills/snapshot ~/.claude/skills/
```

## Use

```
take a snapshot
sync the snapshot
what does this app do right now?
```

## Code index (JS/TS, optional)

`scripts/code-index.js` reads the code once and fills two marker blocks:

- `SNAPSHOT.md` → constants table: exported `UPPER_SNAKE_CASE` constants and `// @snapshot`-tagged values
- `CODEMAP.md` → file → exports index: functions, classes, types, with the first comment line

Add the markers once where you want each block:

```markdown
<!-- constants:start -->
<!-- constants:end -->

<!-- codemap:start -->
<!-- codemap:end -->
```

Then ask the agent to run the code index, or run it yourself from the project root. The script sits in the
`scripts/` folder of the skill. After a copy install that is:

```bash
node ~/.claude/skills/snapshot/scripts/code-index.js . --only src/config,src/constants
```

After a plugin install the skill lives in Claude Code's plugin folder, so let the agent run it: the skill tells it
where the script is.

It changes only the text between the markers, writes only when something changed, and redacts values whose names
look like credentials. It needs `typescript` in the project.

## License

MIT
