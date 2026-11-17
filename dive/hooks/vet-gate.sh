#!/usr/bin/env bash
# PreToolUse(Bash) hook: block a `git commit` until the vet check has run on the exact tree
# being committed. The check itself is the `vet` skill; this script only decides when to ask for it.
#
# Lets the commit through when:
#   - the command is not a git commit, or this is not a git repo
#   - the diff is docs-only, lockfile-only, or adds fewer than VET_MIN_LINES lines (default 10)
#   - the marker file holds the hash of the tree being committed (the check already ran on it)
#   - VET_GATE=off is set in the environment
# Any internal failure lets the commit through: the gate must never wedge a session.

set -uo pipefail

[ "${VET_GATE:-on}" = "off" ] && exit 0
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
RE='(^|[^[:alnum:]_-])git([[:space:]]+-[^[:space:]]+([[:space:]]+[^-[:space:]][^[:space:]]*)?)*[[:space:]]+commit([[:space:]]|$)'
[[ "$CMD" =~ $RE ]] || exit 0

# The commit's own options: the text after `git commit`, without quoted strings (commit messages) and without
# whatever follows the command (&&, ||, ;, |). Reading flags from the whole command line would take a "-a" inside a
# message, or in a later command, for `commit -a`.
ARGS=${CMD#*"${BASH_REMATCH[0]}"}
ARGS=$(printf '%s' "$ARGS" | tr '\n' ' ' | sed -E "s/\"(\\\\.|[^\"\\\\])*\"//g; s/'[^']*'//g; s/(&&|\|\||;|\|).*//" 2>/dev/null) || ARGS=""

# The repo is the one the command runs in: the hook input's cwd, then the project directory.
ROOT=$(printf '%s' "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)
[ -n "$ROOT" ] && [ -d "$ROOT" ] || ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$ROOT" 2>/dev/null || exit 0
GIT_DIR=$(git rev-parse --absolute-git-dir 2>/dev/null) || exit 0
MARKER="$GIT_DIR/vet-checked"

# The tree the commit will record. With -a / --all, include tracked edits that are not staged yet.
TMP_INDEX=""
cleanup() { [ -n "$TMP_INDEX" ] && rm -f "$TMP_INDEX"; }
trap cleanup EXIT
if printf '%s' "$ARGS" | grep -qE '(^|[[:space:]])(-[[:alnum:]]*a[[:alnum:]]*|--all)([[:space:]]|$)'; then
  TMP_INDEX=$(mktemp) || exit 0
  cp "$GIT_DIR/index" "$TMP_INDEX" 2>/dev/null || : > "$TMP_INDEX"
  GIT_INDEX_FILE="$TMP_INDEX" git add -u 2>/dev/null || exit 0
  export GIT_INDEX_FILE="$TMP_INDEX"
fi
TREE=$(git write-tree 2>/dev/null) || exit 0

[ -f "$MARKER" ] && [ "$(cat "$MARKER" 2>/dev/null)" = "$TREE" ] && exit 0

# Count added lines in code files only.
# Dots are written [.] because awk -v would unescape a backslash-dot into a plain dot.
IGNORE='([.](md|mdx|markdown|txt|rst|adoc)$|(^|/)docs?/|(^|/)(package-lock[.]json|yarn[.]lock|pnpm-lock[.]yaml|bun[.]lockb?|Podfile[.]lock|Cargo[.]lock|poetry[.]lock|uv[.]lock|Gemfile[.]lock|composer[.]lock|go[.]sum)$|(^|/)LICENSE([.][[:alnum:]]+)?$)'
ADDED=$(git diff --cached --numstat 2>/dev/null | awk -F'\t' -v re="$IGNORE" '$1 != "-" && $3 !~ re { s += $1 } END { print s + 0 }')
MIN="${VET_MIN_LINES:-10}"
case "$MIN" in '' | *[!0-9]*) MIN=10 ;; esac
[ "$ADDED" -lt "$MIN" ] && exit 0

REASON="Commit paused by the vet gate: the staged diff adds $ADDED lines of code and has not been checked yet.
Run the vet skill on the staged diff before committing (it spawns a fresh read-only subagent, then you act on
its findings). When done, record the check and retry the same commit:
  git write-tree > \"$MARKER\"
(with -a/--all, stage your changes with 'git add -u' first, then record and commit). To bypass once, the user can
set VET_GATE=off."

jq -nc --arg r "$REASON" \
  '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}' 2>/dev/null || exit 0
exit 0
