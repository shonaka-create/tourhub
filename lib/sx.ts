import type { CSSProperties } from "react";

/**
 * Parse a CSS declaration string (as used in HTML `style="..."` attributes)
 * into a React style object. This lets us port the original Tourhub design's
 * inline styles almost verbatim while staying idiomatic React.
 *
 *   sx("display:flex;gap:10px;color:#fff")
 *     -> { display: "flex", gap: "10px", color: "#fff" }
 *
 * Values never contain semicolons in this design, and only the first colon of a
 * declaration separates property from value, so a simple split is safe.
 */
export function sx(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const trimmed = decl.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const rawProp = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!rawProp) continue;
    out[toCamel(rawProp)] = value;
  }
  return out as CSSProperties;
}

function toCamel(prop: string): string {
  // Vendor prefixes: -webkit- -> Webkit, -moz- -> Moz, -ms- -> ms (lowercase)
  let p = prop;
  let leadingCap = false;
  if (p.startsWith("-ms-")) {
    p = p.slice(4);
  } else if (p.startsWith("-")) {
    p = p.slice(1);
    leadingCap = true;
  }
  p = p.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  return leadingCap ? p.charAt(0).toUpperCase() + p.slice(1) : p;
}
