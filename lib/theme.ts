// Shared palette and style snippets, mirroring the original Tourhub design.

export const C = {
  ink: "#0E2A3D",
  sub: "#6E8BA0",
  line: "#E6EEF4",
  soft: "#F0F6FA",
  blue: "#0E8FC9",
  deep: "#0A5688",
  teal: "#22B3C9",
  mint: "#7FD4C0",
  green: "#16A34A",
  amber: "#F59E0B",
  orange: "#F97316",
  red: "#E5484D",
} as const;

export const card = `background:#fff;border:1px solid ${C.line};border-radius:18px;`;
export const h2 = `font-weight:800;font-size:16px;color:${C.ink};`;
export const label = `font-size:11px;color:${C.sub};font-weight:600;`;

export const btn = (bg: string, col: string) =>
  `background:${bg};color:${col};border:none;font-family:inherit;font-weight:700;font-size:13px;padding:10px 16px;border-radius:11px;cursor:pointer;`;

export function bar(pct: number, color: string): string {
  return `<div style="height:6px;background:#EAF0F5;border-radius:5px;overflow:hidden;flex:1"><div style="height:100%;width:${pct}%;background:${color};border-radius:5px"></div></div>`;
}

export function pill(text: string, col: string, bg: string): string {
  return `<span style="font-size:10px;font-weight:800;color:${col};background:${bg};padding:3px 9px;border-radius:7px;white-space:nowrap">${text}</span>`;
}

/** Build a full <svg> string from inner path markup. `path` may use COL as a color placeholder. */
export function icon(path: string, color: string, w = 16): string {
  return `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none">${path.replace(/COL/g, color)}</svg>`;
}
