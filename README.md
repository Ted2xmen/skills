# skills

Claude Code plugins: skills and output styles for everyday agent work.

| Plugin | Type | What it does |
|---|---|---|
| [exact](exact/) | output style | Short replies that keep every number, condition, caveat and verification status. Two styles: **Exact** and **Exact Dense**. |
| [snapshot](snapshot/) | skill | Writes and syncs `SNAPSHOT.md`, a code-verified picture of what a product does right now, with an optional script that indexes constants and exports. |
| [dive](dive/) | skills + hook | Read-only code inspection: **vet** checks the staged diff before every commit (a hook asks for it), **audit** gives a milestone a Go / No-go verdict, **dive** reviews any scope through a lens (correctness, simplify, or a topic like analytics or i18n). |

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
```

Update later with `claude plugin update`.

Each plugin's README also shows how to install it by copying files, without the marketplace.

## Layout

```
.claude-plugin/marketplace.json   the plugin list
<plugin>/
  .claude-plugin/plugin.json
  output-styles/, skills/, hooks/ the plugin's files
  README.md
```

## License

MIT — see [LICENSE](LICENSE).
