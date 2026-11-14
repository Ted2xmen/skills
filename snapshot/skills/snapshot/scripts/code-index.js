#!/usr/bin/env node
/*
 * code-index.js — reads a JS/TS codebase once and fills two marker blocks. No model, no network.
 *
 *   SNAPSHOT.md  <!-- constants:start --> … <!-- constants:end -->
 *     `Constant | Value | Source | Purpose` table of exported UPPER_SNAKE_CASE constants
 *     and of any variable tagged with a `// @snapshot` comment directly above it.
 *
 *   CODEMAP.md   <!-- codemap:start --> … <!-- codemap:end -->
 *     file → exports index: functions, classes, types, interfaces, enums, consts, re-exports,
 *     each with the first line of its leading comment.
 *
 * Only the text between the markers changes. A file without its markers is not written.
 * A block is written only when its content changed, so re-runs give no diff.
 *
 * Usage: node code-index.js [project-root] [options]
 *   --constants        fill only the constants block
 *   --exports          fill only the codemap block
 *                      (neither flag: fill every block whose markers exist)
 *   --only a,b         constants: scan only these folders (relative to the root)
 *   --tagged           constants: list only `// @snapshot`-tagged variables
 *   --file PATH        SNAPSHOT.md path (default: ./SNAPSHOT.md, then ./docs/SNAPSHOT.md)
 *   --map PATH         CODEMAP.md path  (default: ./CODEMAP.md, then ./docs/CODEMAP.md)
 * Needs `typescript` installed in the project. Without it, it exits 0 and writes nothing.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const USAGE = 'Usage: node code-index.js [project-root] [--constants] [--exports] [--only a,b] [--tagged] [--file SNAPSHOT.md] [--map CODEMAP.md]';
const log = (msg) => console.error('code-index: ' + msg);

// --- 1. Arguments --------------------------------------------------------------------------
const args = process.argv.slice(2);
let ROOT = process.cwd();
let snapArg = null;
let mapArg = null;
let ONLY = null;
let TAGGED_ONLY = false;
let wantConstants = false;
let wantExports = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--file') snapArg = path.resolve(args[++i] || '');
  else if (a === '--map') mapArg = path.resolve(args[++i] || '');
  else if (a === '--only') ONLY = (args[++i] || '').split(',').map((d) => d.trim().replace(/^\.?\/+|\/+$/g, '')).filter(Boolean);
  else if (a === '--tagged') TAGGED_ONLY = true;
  else if (a === '--constants') wantConstants = true;
  else if (a === '--exports') wantExports = true;
  else if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
  else if (a.startsWith('--')) { log(`unknown option ${a}\n${USAGE}`); process.exit(2); }
  else ROOT = path.resolve(a);
}
if (!wantConstants && !wantExports) { wantConstants = true; wantExports = true; }

const firstExisting = (...ps) => ps.find((p) => p && fs.existsSync(p)) || null;
const rel = (p) => path.relative(process.cwd(), p) || p;

// --- 2. Targets: check the markers BEFORE paying for the parse -------------------------------
function target(kind, file, start, end) {
  if (!file) { log(`${kind}: no file found — skipping.`); return null; }
  const doc = fs.readFileSync(file, 'utf8');
  const s = doc.indexOf(start);
  const e = s === -1 ? -1 : doc.indexOf(end, s + start.length);
  if (s === -1) { log(`${kind}: ${rel(file)} has no ${start} marker — add ${start} and ${end} once to enable. Nothing written.`); return null; }
  if (e === -1) { log(`${kind}: ${rel(file)} has ${start} but no ${end} after it — fix the markers. Nothing written.`); return null; }
  return { file, doc, s, e, start, end };
}
const snapTarget = wantConstants
  ? target('constants', snapArg || firstExisting(path.join(ROOT, 'SNAPSHOT.md'), path.join(ROOT, 'docs', 'SNAPSHOT.md')),
      '<!-- constants:start -->', '<!-- constants:end -->')
  : null;
const mapTarget = wantExports
  ? target('codemap', mapArg || firstExisting(path.join(ROOT, 'CODEMAP.md'), path.join(ROOT, 'docs', 'CODEMAP.md')),
      '<!-- codemap:start -->', '<!-- codemap:end -->')
  : null;
if (!snapTarget && !mapTarget) process.exit(0);

// --- 3. TypeScript compiler API, from the project -----------------------------------------
let ts;
try { ts = require(require.resolve('typescript', { paths: [ROOT] })); }
catch (_) { log('typescript is not installed in this project. Nothing written.'); process.exit(0); }
if (typeof ts.createSourceFile !== 'function' || !ts.ScriptTarget) {
  log('this typescript version does not expose the compiler API. Nothing written.');
  process.exit(0);
}

// --- 4. Walk the tree once -------------------------------------------------------------------
const EXCLUDE = /(^|\/)(node_modules|\.git|\.claude|\.husky|\.github|dist|build|out|\.expo|\.next|\.nuxt|\.svelte-kit|coverage|vendor|ios|android)(\/|$)/;
const EXT = /\.(ts|tsx|js|jsx|mjs|cjs|mts|cts)$/;
const IGNORE = /(\.d\.ts$|\.test\.|\.spec\.|\.stories\.)/;
const UPPER_SNAKE = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;
const toRel = (full) => path.relative(ROOT, full).split(path.sep).join('/');

function walk(dir, acc) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return acc; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (EXCLUDE.test('/' + toRel(full))) continue;
    if (e.isDirectory()) walk(full, acc);
    else if (EXT.test(e.name) && !IGNORE.test(e.name)) acc.push(full);
  }
  return acc;
}
const files = walk(ROOT, []).sort();
const inOnly = (r) => !ONLY || ONLY.some((d) => r === d || r.startsWith(d + '/'));

// --- 5. Parse each file once, collect both outputs --------------------------------------------
function getMods(node) {
  if (ts.canHaveModifiers && ts.canHaveModifiers(node)) return ts.getModifiers(node) || [];
  return node.modifiers || [];
}
const has = (node, kind) => getMods(node).some((m) => m.kind === kind);

function leadingComment(sf, node) {
  const text = sf.getFullText();
  const ranges = ts.getLeadingCommentRanges(text, node.getFullStart()) || [];
  if (!ranges.length) return '';
  const r = ranges[ranges.length - 1];
  return text.slice(r.pos, r.end);
}
function purposeFrom(raw, max) {
  const c = raw.replace(/\/\*\*?/, '').replace(/\*\/\s*$/, '')
    .replace(/^\s*\*\s?/gm, '').replace(/^\/\/+\s?/gm, '').replace(/@snapshot/gi, '');
  const first = c.split('\n').map((s) => s.trim()).filter(Boolean)[0] || '';
  return first.slice(0, max).trimEnd();
}

function valueShort(init) {
  if (!init) return '';
  if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) return JSON.stringify(init.text);
  if (ts.isNumericLiteral(init)) return init.text;
  if (init.kind === ts.SyntaxKind.TrueKeyword) return 'true';
  if (init.kind === ts.SyntaxKind.FalseKeyword) return 'false';
  if (init.kind === ts.SyntaxKind.NullKeyword) return 'null';
  if (ts.isPrefixUnaryExpression(init) && ts.isNumericLiteral(init.operand)) return init.getText();
  if ((ts.isAsExpression && ts.isAsExpression(init)) || (ts.isSatisfiesExpression && ts.isSatisfiesExpression(init))) return valueShort(init.expression);
  if (ts.isObjectLiteralExpression(init)) {
    const props = init.properties.map((p) => {
      const n = p.name && p.name.getText ? p.name.getText() : '?';
      const v = p.initializer ? valueShort(p.initializer) : '';
      return v ? `${n}: ${v}` : n;
    });
    return '{ ' + props.join(', ') + ' }';
  }
  if (ts.isArrayLiteralExpression(init)) return `[${init.elements.length} items]`;
  const t = init.getText().replace(/\s+/g, ' ');
  return (t.length > 48 ? t.slice(0, 48) + '…' : t) + '  (expr)';
}
const MAX_VALUE = 80;
const clip = (v) => (v.length > MAX_VALUE ? v.slice(0, MAX_VALUE) + '…' : v);

// Never copy a secret into a doc that goes to git. A name that looks like a credential, or a long
// unbroken string literal that looks like a key, is shown as `[redacted]`.
const SECRET_NAME = /(KEY|SECRET|TOKEN|PASSWORD|PASSWD|PWD|CREDENTIAL|PRIVATE|DSN|AUTH|SIGNATURE|SALT|CERT)/i;
const SECRET_VALUE = /^"[A-Za-z0-9_\-+/=.]{24,}"$/;
const safeValue = (name, v) => (SECRET_NAME.test(name) || SECRET_VALUE.test(v) ? '[redacted]' : v);

const constantRows = [];
const mapSections = [];
let exportCount = 0;

for (const file of files) {
  const r = toRel(file);
  const wantConstHere = snapTarget && inOnly(r);
  if (!wantConstHere && !mapTarget) continue;
  let sf;
  try { sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true); }
  catch (_) { continue; }

  const exps = [];
  const pushExp = (name, kind, node) => exps.push({ name, kind, purpose: node ? purposeFrom(leadingComment(sf, node), 90) : '' });

  sf.forEachChild((node) => {
    const isExport = has(node, ts.SyntaxKind.ExportKeyword);
    const isDefault = has(node, ts.SyntaxKind.DefaultKeyword);

    // constants
    if (wantConstHere && ts.isVariableStatement(node)) {
      const raw = leadingComment(sf, node);
      const tagged = /@snapshot/i.test(raw);
      for (const d of node.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue;
        const name = d.name.text;
        if (!tagged && (TAGGED_ONLY || !(isExport && UPPER_SNAKE.test(name)))) continue;
        const line = sf.getLineAndCharacterOfPosition(d.getStart()).line + 1;
        constantRows.push({ name, value: safeValue(name, clip(valueShort(d.initializer))), src: `${r}:${line}`, purpose: purposeFrom(raw, 80) });
      }
    }

    // exports
    if (!mapTarget) return;
    if (ts.isExportAssignment(node)) {
      let name = node.expression && node.expression.getText ? node.expression.getText().replace(/\s+/g, ' ').replace(/`/g, "'") : 'default';
      if (name.length > 40) name = ts.isIdentifier(node.expression) ? name : name.slice(0, 40) + '…';
      pushExp(name, 'default export', node);
      return;
    }
    if (ts.isExportDeclaration(node) && node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const el of node.exportClause.elements) pushExp(el.name.text, 're-export', node);
      return;
    }
    if (!isExport) return;
    if (ts.isFunctionDeclaration(node) && node.name) pushExp(isDefault ? node.name.text + ' (default)' : node.name.text, 'function', node);
    else if (ts.isFunctionDeclaration(node) && isDefault) pushExp('default', 'default function', node);
    else if (ts.isClassDeclaration(node) && node.name) pushExp(node.name.text, 'class', node);
    else if (ts.isInterfaceDeclaration(node)) pushExp(node.name.text, 'interface', node);
    else if (ts.isTypeAliasDeclaration(node)) pushExp(node.name.text, 'type', node);
    else if (ts.isEnumDeclaration(node)) pushExp(node.name.text, 'enum', node);
    else if (ts.isVariableStatement(node)) {
      for (const d of node.declarationList.declarations) {
        if (!ts.isIdentifier(d.name)) continue;
        const init = d.initializer;
        pushExp(d.name.text, init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) ? 'function' : 'const', node);
      }
    }
  });

  if (mapTarget && exps.length) {
    const seen = new Set();
    const list = exps
      .filter((x) => { const k = x.kind + ':' + x.name; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => a.name.localeCompare(b.name));
    exportCount += list.length;
    mapSections.push(`### ${r}\n\n` + list.map((x) => `- \`${x.name}\` (${x.kind})${x.purpose ? ` — ${x.purpose}` : ''}`).join('\n'));
  }
}

// --- 6. Write the blocks that changed ------------------------------------------------------
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function writeBlock(t, body, summary) {
  const next = t.doc.slice(0, t.s) + `${t.start}\n${body}\n${t.end}` + t.doc.slice(t.e + t.end.length);
  if (next === t.doc) { log(`${summary} — ${rel(t.file)} unchanged, nothing written.`); return; }
  fs.writeFileSync(t.file, next);
  log(`${summary} — wrote ${rel(t.file)}.`);
}

if (snapTarget) {
  constantRows.sort((a, b) => a.src.localeCompare(b.src) || a.name.localeCompare(b.name));
  const table = constantRows.length
    ? '| Constant | Value | Source | Purpose |\n|---|---|---|---|\n' +
      constantRows.map((x) => `| \`${esc(x.name)}\` | ${esc(x.value)} | ${esc(x.src)} | ${esc(x.purpose)} |`).join('\n')
    : '_No constants found (exported UPPER_SNAKE_CASE or `// @snapshot`-tagged)._';
  writeBlock(snapTarget, `<!-- generated by code-index.js — do not edit by hand -->\n${table}`, `constants: ${constantRows.length}`);
}

if (mapTarget) {
  const note = `> Generated by \`code-index.js\` — edits inside this block are overwritten. ` +
    `${mapSections.length} files · ${exportCount} exports.`;
  const body = `\n${note}\n\n${mapSections.length ? mapSections.join('\n\n') : '_No exports found._'}\n`;
  writeBlock(mapTarget, body, `codemap: ${mapSections.length} files, ${exportCount} exports`);
}
