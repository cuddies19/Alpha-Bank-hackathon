import type { CSSProperties } from 'react';

/** «box-shadow: inset 0 0 0 2px var(--ink);» → { boxShadow: '…' }. Для стилей, которые экран собирает строкой. */
export function parseStyle(css: string | undefined | null): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of String(css ?? '').split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const key = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!key) continue;
    out[key.startsWith('--') ? key : key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return out as CSSProperties;
}
