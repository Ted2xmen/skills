# skills

Claude Code plugins: skills and output styles for everyday agent work.

| Plugin | Type | What it does |
|---|---|---|
| [exact](exact/) | output style | Short replies that keep every number, condition, caveat and verification status. Two styles: **Exact** and **Exact Dense**. |
| [snapshot](snapshot/) | skill | Writes and syncs `SNAPSHOT.md`, a code-verified picture of what a product does right now, with an optional script that indexes constants and exports. |

## Install

Add the marketplace once:

```bash
claude plugin marketplace add Ted2xmen/skills
```

Then install what you need:

```bash
claude plugin install exact@ted2xmen-skills
claude plugin install snapshot@ted2xmen-skills
```

Update later with `claude plugin update`.

Each plugin's README also shows how to install it by copying files, without the marketplace.

## Layout

```
.claude-plugin/marketplace.json   the plugin list
<plugin>/
  .claude-plugin/plugin.json
  output-styles/ or skills/       the plugin's files
  README.md
```

## License

MIT — see [LICENSE](LICENSE).
