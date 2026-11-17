# skills

Claude Code plugins: skills and output styles for everyday agent work.

| Plugin | Type | What it does |
|---|---|---|
| [exact](exact/) | output style | Short replies that keep every number, condition, caveat and verification status. Two styles: **Exact** and **Exact Dense**. |
| [snapshot](snapshot/) | skill | Writes and syncs `SNAPSHOT.md`, a code-verified picture of what a product does right now, with an optional script that indexes constants and exports. |
| [dive](dive/) | skills + hook | Read-only code inspection: **vet** checks the staged diff before every commit (a hook asks for it), **audit** gives a milestone a Go / No-go verdict, **dive** reviews any scope through a lens (correctness, simplify, or a topic like analytics or i18n). |
| [playbook](playbook/) | skills | Working methods for agents: **fable-playbook** plans, breaks down and verifies any multi-step task, **debug** is a reproduce, isolate, fix and confirm flow for bugs, **delegation-brief** is a template for handing work to subagents and checking what comes back, **prd-guide** structures a PRD for a new product or SaaS. |

## Install

Add the marketplace once:

```bash
claude plugin marketplace add Ted2xmen/skills
```

Then install what you need:

```bash
claude plugin install exact@ted2xmen-skills
claude plugin install snapshot@ted2xmen-skills
claude plugin install dive@ted2xmen-skills
claude plugin install playbook@ted2xmen-skills
```

Update later with `claude plugin update`.

Each plugin's README also shows how to install it by copying files, without the marketplace.

## Requirements

- Claude Code with plugin support. See [installing plugins](https://code.claude.com/docs/en/plugins/install).
- `dive`: the commit gate needs `bash`, `git` and `jq`. Without `jq` the gate lets every commit through.
- `snapshot`: the optional code index needs `node`, and `typescript` installed in the project it scans.

The scripts make no network calls and need no API key.

## Use

Skills load on their own when a task matches. You can also ask for one:

| Plugin | Try |
|---|---|
| exact | `/output-style Exact` |
| snapshot | "take a snapshot", "sync the snapshot" |
| dive | "vet this", "audit the last 5 commits", "what can I delete in the sync module" |
| playbook | "use the fable playbook for this", "debug this failing test", "write a delegation brief", "write a PRD for this idea" |

## Layout

```
.claude-plugin/marketplace.json   the plugin list
<plugin>/
  .claude-plugin/plugin.json
  output-styles/, skills/, hooks/ the plugin's files
  README.md
  LICENSE
LICENSE
```

Every skill is plain Markdown: read it before you install it.

## Contributing

Issues and pull requests are welcome. Keep a change to one plugin, keep skills free of project-specific names and
paths, and run `claude plugin validate .` before you open a pull request.

## License

MIT. See [LICENSE](LICENSE).
