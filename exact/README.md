# exact

Two Claude Code output styles for short replies that stay precise.

Built-in terse modes make Claude brief by deleting words. Some of those words carry meaning: "likely",
"only if", "not run", "about 12". Exact deletes filler and keeps those words. Replies get shorter
and still say exactly what Claude knows, with the same certainty.

| Style | Use it when |
|---|---|
| **Exact** | You want short full sentences that cannot be misread. |
| **Exact Dense** | You want maximum density: bullets, tables, `→` for causes. |

## Compared with the built-in styles

| | Default | Concise | Exact |
|---|---|---|---|
| Preamble and recaps | some | cut | cut |
| Hedges and certainty | kept | not specified | kept, never upgraded |
| Conditions and scope | kept | not specified | kept |
| Verification status (ran vs. read) | varies | not specified | always stated |
| Sentence rules | none | none | one claim, ≤20 words per instruction and ≤25 per description, active voice, one name per thing |
| Self-check before sending | no | no | 5 checks |

"Not specified" means the built-in style does not state a rule for it.

## Install

As a plugin:

```bash
claude plugin marketplace add Ted2xmen/skills
claude plugin install exact@ted2xmen-skills
```

Or copy the files:

```bash
git clone https://github.com/Ted2xmen/skills
cp skills/exact/output-styles/*.md ~/.claude/output-styles/
```

Then pick the style with `/output-style Exact`, or in `/config` → Output style.
Restart Claude Code after you copy or edit a style file.

Both styles set `keep-coding-instructions: true`, so Claude keeps its built-in software engineering instructions.

## Scope

- Changes replies to you only. Code, commits, PR text and written files keep their own conventions.
- The sentence rules are for English. In other languages only the cut and keep rules apply.
- It fixes form, not content.

See [examples.md](examples.md) for before/after cases.

## License

MIT. See [LICENSE](LICENSE).
