// Конвертер артбордов Claude Design (.dc.html) в React + TypeScript.
// npm run import-design  (= node scripts/convert-design.mjs design-source src/screens && prettier)
import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'htmlparser2';

const [, , SRC, OUT] = process.argv;
const canvas = JSON.parse(fs.readFileSync(path.join(SRC, 'canvas.json'), 'utf8'));
const files = canvas.order;

const stemOf = (f) => f.replace(/\.dc\.html$/, '');
const compName = (stem) => stem.replace(/[^A-Za-z0-9]/g, '');
const routeOf = (stem) => (stem === 'Main' ? '/' : '/' + stem.toLowerCase());
const DC_HREF = /^([A-Za-z0-9_-]+)\.dc\.html$/;
const HOLE = /\{\{\s*([A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*\}\}/g;
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// Компоненты дизайн-системы, которые принимают style (остальные его игнорируют — как в бандле)
const STYLE_OK = new Set(['Icon', 'Button', 'Chip', 'TextField', 'Card']);
const INLINE = new Set(['a', 'span', 'b', 'strong', 'i', 'em', 'time', 'small', 'code', 'label', 'abbr', 'sup', 'sub', 'mark', 'x-import', 'svg', 'input', 'button', 'img', 'br']);
const BOOL_ATTRS = new Set(['disabled', 'checked', 'readonly', 'required', 'hidden', 'multiple', 'selected', 'autofocus', 'open']);
// Точечные правки типов там, где логика макета слишком динамична для вывода типов TypeScript
const FIXUPS = {
  'B12-Loans': [['const all = [];', 'const all: ScreenValues[] = [];']],
  'C2Head': [['const out = { i16: 16 };', 'const out: ScreenValues = { i16: 16 };']],
  'Main': [['const cur = all.find((p) => p.id === uid);', 'const cur = all.find((p) => p.id === uid)!;']],
  'M-Login': [['const cur = all.find((p) => p.id === uid);', 'const cur = all.find((p) => p.id === uid)!;']],
};

const NUMERIC_ATTRS = new Set(['maxLength', 'minLength', 'rows', 'cols', 'tabIndex', 'colSpan', 'rowSpan', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-level', 'aria-setsize', 'aria-posinset', 'aria-colcount', 'aria-rowcount']);
const ATTR_MAP = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', maxlength: 'maxLength', minlength: 'minLength',
  inputmode: 'inputMode', autocomplete: 'autoComplete', readonly: 'readOnly', colspan: 'colSpan', rowspan: 'rowSpan',
  spellcheck: 'spellCheck', autofocus: 'autoFocus', datetime: 'dateTime', enterkeyhint: 'enterKeyHint',
};

function jsonStr(s) { return JSON.stringify(s); }

function convertFile(file) {
  const html = fs.readFileSync(path.join(SRC, file), 'utf8');
  const doc = parseDocument(html, { lowerCaseAttributeNames: false, lowerCaseTags: false, recognizeSelfClosing: true, decodeEntities: true });
  const find = (n, pred) => {
    if (pred(n)) return n;
    for (const c of n.children || []) { const r = find(c, pred); if (r) return r; }
    return null;
  };
  const xdc = find(doc, (n) => n.type === 'tag' && n.name === 'x-dc');
  const script = find(doc, (n) => n.type === 'script' && n.attribs && 'data-dc-script' in n.attribs);
  const title = find(doc, (n) => n.type === 'tag' && n.name === 'title');
  const dataProps = JSON.parse(script.attribs['data-props'] || '{}');
  const code = script.children.map((c) => c.data).join('');

  // ---------- логика экрана: renderVals() → хук
  const start = code.indexOf('renderVals()');
  const open = code.indexOf('{', start);
  let depth = 0, end = -1, q = null;
  for (let i = open; i < code.length; i++) {
    const ch = code[i];
    if (q) { if (ch === '\\') i++; else if (ch === q) q = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { q = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  let body = code.slice(open + 1, end);
  // Константы-заглушки формата ({{yes}}, {{i16}}) подставляем литералами прямо в разметку
  const consts = {};
  const retAt = body.lastIndexOf('return {');
  if (retAt >= 0) {
    let ret = body.slice(retAt);
    ret = ret.replace(/(?<=[{,\s])(yes|no|i\d+)\s*:\s*(true|false|\d+)\b\s*(,\s*)?/g, (m, k, val) => { consts[k] = val; return ''; });
    ret = ret.replace(/,(\s*)\}/, '$1}');
    body = body.slice(0, retAt) + ret;
  }
  body = body
    .replace(/this\.setState/g, 'setState')
    .replace(/this\.state/g, 'state')
    .replace(/this\.props/g, 'props')
    .replace(/(['"])([A-Za-z0-9_-]+)\.dc\.html\1/g, (m, qq, stem) => jsonStr(routeOf(stem)));
  const trivial = /^\s*return\s*\{\s*\};?\s*$/.test(body);
  const usesState = /\b(state|setState)\b/.test(body);
  const usesProps = /\bprops\b/.test(body);

  const propKeys = Object.keys(dataProps).filter((k) => !k.startsWith('$'));
  const propType = (p) => p.editor === 'enum' ? p.options.map(jsonStr).join(' | ') : p.editor === 'boolean' ? 'boolean' : p.editor === 'number' ? 'number' : 'string';

  // ---------- разметка → JSX
  const imports = { ui: new Set(), screens: new Set(), link: false, style: false };

  function expr(pathStr, scope) {
    const head = pathStr.split('.')[0];
    if (scope.has(head)) return pathStr;
    if (pathStr in consts) return consts[pathStr];
    return 'v.' + pathStr;
  }
  function holeExpr(value, scope) {
    const m = value.match(/^\s*\{\{\s*([A-Za-z_$][\w$]*(?:\.[\w$]+)*)\s*\}\}\s*$/);
    if (m) return expr(m[1], scope);
    if (!value.includes('{{')) return null;
    const tpl = value.replace(/`/g, '\\`').replace(HOLE, (_, p) => '${' + expr(p, scope) + '}');
    return '`' + tpl + '`';
  }
  function styleProp(value, scope) {
    const parts = [];
    for (let decl of value.split(';')) {
      decl = decl.trim();
      if (!decl) continue;
      const whole = decl.match(/^\{\{\s*([\w$.]+)\s*\}\}$/);
      if (whole) { imports.style = true; parts.push('...parseStyle(' + expr(whole[1], scope) + ')'); continue; }
      const i = decl.indexOf(':');
      const k = decl.slice(0, i).trim();
      const val = decl.slice(i + 1).trim();
      const key = k.startsWith('--') ? jsonStr(k) : /^[a-z-]+$/.test(k) ? camel(k.replace(/^-ms-/, 'ms-')) : jsonStr(k);
      const he = holeExpr(val, scope);
      parts.push(key + ': ' + (he ?? jsonStr(val)));
    }
    return '{{ ' + parts.join(', ') + ' }}';
  }
  function attrValue(v, scope) {
    const he = holeExpr(v, scope);
    if (he !== null) return '{' + he + '}';
    if (DC_HREF.test(v)) return jsonStr(routeOf(v.match(DC_HREF)[1]));
    if (/[&"\\\n]/.test(v)) return '{' + jsonStr(v) + '}';
    return '"' + v + '"';
  }

  function attrs(node, scope, kind) {
    const out = [];
    const a = node.attribs;
    const hasChange = 'onChange' in a;
    for (let [name, val] of Object.entries(a)) {
      if (name.startsWith('hint-') || name === 'component-from-global-scope' || (kind === 'dc' && name === 'name')) continue;
      let key;
      if (kind === 'ui' || kind === 'dc') key = name.startsWith('aria-') || name.startsWith('data-') ? name : ATTR_MAP[name] || camel(name);
      else key = ATTR_MAP[name] || (name.includes('-') && !/^(aria|data)-/.test(name) ? camel(name) : name);
      if (kind === 'ui' && key === 'style' && !STYLE_OK.has(node.attribs['component-from-global-scope'].replace('Cabinet.', ''))) continue;
      if (kind === 'link' && key === 'href') key = 'to';
      if (kind === 'html' && ['input', 'textarea', 'select'].includes(node.name) && !hasChange) {
        if (key === 'value') key = 'defaultValue';
        if (key === 'checked') key = 'defaultChecked';
      }
      if (key === 'style') { out.push('style=' + styleProp(val, scope)); continue; }
      if (kind === 'html' && BOOL_ATTRS.has(name) && (val === '' || val === name)) { out.push(key === 'checked' ? 'defaultChecked' : key); continue; }
      if (NUMERIC_ATTRS.has(key) && /^-?\d+(\.\d+)?$/.test(val)) { out.push(key + '={' + val + '}'); continue; }
      out.push(key + '=' + attrValue(val, scope));
    }
    return out.length ? ' ' + out.join(' ') : '';
  }

  const loopIdx = ['i', 'j', 'k', 'l'];
  function children(node, scope, depth) {
    const kids = (node.children || []).filter((c) => c.type !== 'comment');
    const out = [];
    kids.forEach((c, idx) => {
      if (c.type === 'text') {
        let t = c.data.replace(/\s+/g, ' ');
        const prev = kids[idx - 1], next = kids[idx + 1];
        const inl = (n) => n && n.type === 'tag' && INLINE.has(n.name);
        if (!t.trim()) { if (inl(prev) && inl(next)) out.push(' '); return; }
        if (!inl(prev)) t = t.replace(/^ /, '');
        if (!inl(next)) t = t.replace(/ $/, '');
        out.push(text(t, scope));
        return;
      }
      if (c.type === 'tag' || c.type === 'script' || c.type === 'style') out.push(element(c, scope, depth));
    });
    return out.join('');
  }
  function text(t, scope) {
    let res = '';
    let last = 0;
    for (const m of t.matchAll(HOLE)) {
      res += lit(t.slice(last, m.index));
      res += '{' + expr(m[1], scope) + '}';
      last = m.index + m[0].length;
    }
    return res + lit(t.slice(last));
  }
  function lit(s) {
    if (!s) return '';
    if (/[{}<>]/.test(s)) return '{' + jsonStr(s) + '}';
    return s;
  }
  function element(n, scope, depth) {
    if (n.name === 'helmet') return '';
    if (n.name === 'sc-for') {
      const list = n.attribs.list.match(/\{\{\s*([\w$.]+)\s*\}\}/)[1];
      const as = n.attribs.as;
      const idxName = loopIdx[depth] || 'i' + depth;
      const inner = new Set(scope); inner.add(as);
      const els = n.children.filter((c) => c.type === 'tag');
      const onlyEl = els.length === 1 && !els[0].name.startsWith('sc-') && n.children.every((c) => c.type === 'tag' || !c.data.trim());
      let body;
      if (onlyEl) body = element(els[0], inner, depth + 1, idxName);
      else body = '<Fragment key={' + idxName + '}>' + children(n, inner, depth + 1) + '</Fragment>';
      if (!onlyEl) imports.fragment = true;
      if (onlyEl) body = body.replace(/^<([\w.]+)/, '<$1 key={' + idxName + '}');
      return '{' + expr(list, scope) + '.map((' + as + ', ' + idxName + ') => (' + body + '))}';
    }
    if (n.name === 'sc-if') {
      const cond = holeExpr(n.attribs.value, scope);
      return '{' + cond + ' ? (<>' + children(n, scope, depth) + '</>) : null}';
    }
    let tag, kind = 'html';
    if (n.name === 'x-import') {
      tag = n.attribs['component-from-global-scope'].replace('Cabinet.', '');
      imports.ui.add(tag); kind = 'ui';
    } else if (n.name === 'dc-import') {
      tag = compName(n.attribs.name); imports.screens.add(n.attribs.name); kind = 'dc';
    } else if (n.name === 'a' && n.attribs.href && (DC_HREF.test(n.attribs.href) || n.attribs.href.includes('{{'))) {
      tag = 'Link'; imports.link = true; kind = 'link';
    } else tag = n.name;
    let a = attrs(n, scope, kind);
    let inner = children(n, scope, depth);
    if (tag === 'textarea' && inner) {
      const t = n.children.map((c) => c.data || '').join('').trim();
      a += ' defaultValue=' + attrValue(t, scope);
      inner = '';
    }
    if (!inner && (kind !== 'html' || ['input', 'img', 'br', 'hr', 'meta', 'link', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'].includes(tag) || !n.children.length)) {
      if (kind === 'html' && !['input', 'img', 'br', 'hr', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'].includes(tag)) return '<' + tag + a + '></' + tag + '>';
      return '<' + tag + a + ' />';
    }
    return '<' + tag + a + '>' + inner + '</' + tag + '>';
  }

  const rootKids = xdc.children.filter((c) => !(c.type === 'tag' && c.name === 'helmet') && !(c.type === 'text' && !c.data.trim()));
  let jsx = children({ children: rootKids }, new Set(), 0);
  if (rootKids.filter((c) => c.type === 'tag').length !== 1) jsx = '<>' + jsx + '</>';

  const stem = stemOf(file);
  const name = compName(stem);
  const board = canvas.boards[file];
  const lines = [];
  lines.push('// ' + (board.title || stem) + ' — перенесено из макета «' + canvas.title + '» (' + file + ')');
  const react = [];
  if (imports.fragment) react.push('Fragment');
  if (react.length) lines.push("import { " + react.join(', ') + " } from 'react';");
  if (imports.link) lines.push("import { Link } from 'react-router-dom';");
  if (imports.ui.size) lines.push('import { ' + [...imports.ui].sort().join(', ') + " } from '../ui';");
  if (usesState) lines.push("import { useMergeState } from '../lib/useMergeState';");
  if (!trivial) lines.push("import type { ScreenValues } from '../lib/screen';");
  if (imports.style) lines.push("import { parseStyle } from '../lib/parseStyle';");
  for (const s of [...imports.screens].sort()) lines.push('import ' + compName(s) + " from './" + s + "';");
  lines.push('');
  if (propKeys.length) {
    lines.push('export interface ' + name + 'Props {');
    for (const k of propKeys) lines.push('  ' + k + '?: ' + propType(dataProps[k]) + ';');
    lines.push('}', '');
  }
  const P = propKeys.length ? name + 'Props' : null;
  if (!trivial) {
    lines.push('function useScreen(' + (usesProps ? 'props: ' + P : '') + '): ScreenValues {');
    if (usesState) lines.push('  const [state, setState] = useMergeState<any>();');
    lines.push(body.replace(/^\n/, '').replace(/\s+$/, ''));
    lines.push('}', '');
  }
  lines.push('export default function ' + name + '(' + (P ? (usesProps ? 'props: ' + P : '_props: ' + P) : '') + ') {');
  if (!trivial) lines.push('  const v = useScreen(' + (usesProps ? 'props' : '') + ');');
  lines.push('  return (' + jsx + ');');
  lines.push('}', '');
  let src = lines.join('\n');
  for (const [from, to] of FIXUPS[stem] || []) {
    if (!src.includes(from)) throw new Error(stem + ': правка не применилась: ' + from);
    src = src.replace(from, to);
  }
  fs.writeFileSync(path.join(OUT, stem + '.tsx'), src);
  return { file, stem, name, route: routeOf(stem), title: board.title || stem, page: board.page, w: board.w, h: board.h, fill: board.expand === 'fill', docTitle: title ? title.children.map((c) => c.data).join('') : stem };
}

const meta = files.map(convertFile);
const reg = [];
reg.push('// Список экранов макета — сгенерирован из canvas.json');
reg.push("import { lazy, type ComponentType, type LazyExoticComponent } from 'react';", '');
reg.push('export interface ScreenEntry { path: string; file: string; title: string; docTitle: string; group: string; width: number; fluid: boolean; Component: LazyExoticComponent<ComponentType> }', '');
reg.push('export const groups: { id: string; name: string }[] = ' + JSON.stringify(canvas.pages) + ';', '');
reg.push('export const screens: ScreenEntry[] = [');
for (const m of meta) reg.push('  { path: ' + jsonStr(m.route) + ', file: ' + jsonStr(m.stem) + ', title: ' + jsonStr(m.title) + ', docTitle: ' + jsonStr(m.docTitle) + ', group: ' + jsonStr(m.page) + ', width: ' + m.w + ', fluid: ' + m.fill + ", Component: lazy(() => import('./" + m.stem + "')) },");
reg.push('];', '');
fs.writeFileSync(path.join(OUT, 'registry.ts'), reg.join('\n'));
console.log('converted', meta.length);
