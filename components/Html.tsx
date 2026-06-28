import type { CSSProperties } from "react";

/** Renders a raw HTML string (used for inline SVG icons ported from the design). */
export function Html({
  html,
  style,
  className,
}: {
  html: string;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
