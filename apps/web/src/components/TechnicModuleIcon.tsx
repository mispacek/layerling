import type { SVGProps } from "react";

/** Neutral shaded parts match the shape catalogue; openings show the actual profile. */
export function TechnicModuleIcon({ kind, ...props }: SVGProps<SVGSVGElement> & {
  kind: "builder" | "solid" | "pin" | "axle";
}) {
  return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...props}>
    {kind === "builder" ? <g stroke="#777" strokeWidth="0.7" strokeLinejoin="round">
      <path d="M4 14 33 4 44 12 15 22Z" fill="#eee" />
      <path d="M4 14 15 22V38L4 30Z" fill="#aaa" />
      <path d="M15 22 44 12V28L15 38Z" fill="#c8c8c8" />
      <g transform="matrix(1 -.345 0 1 15 22)" fill="#454545" stroke="#f1f1f1" strokeWidth="1.2">
        <circle cx="6" cy="8" r="3.6" />
        <circle cx="15" cy="8" r="3.6" />
        <circle cx="24" cy="8" r="3.6" />
      </g>
    </g> : <g stroke="#777" strokeWidth="0.7" strokeLinejoin="round">
      <path d="M5 16 24 6 43 16 24 26Z" fill="#eee" />
      <path d="M5 16 24 26V42L5 32Z" fill="#aaa" />
      <path d="M24 26 43 16V32L24 42Z" fill="#c8c8c8" />
      <g transform="matrix(.95 -.5 .95 .5 5 16)">
        {kind === "pin" ? <>
          <circle cx="10" cy="10" r="6.5" fill="#b6b6b6" stroke="#999" />
          <circle cx="10" cy="10" r="5" fill="#454545" stroke="#fafafa" strokeWidth="0.8" />
        </> : kind === "axle" ? <path
          d="M8 4H12V8H16V12H12V16H8V12H4V8H8Z"
          fill="#454545" stroke="#fafafa" strokeWidth="0.8" /> : null}
      </g>
    </g>}
  </svg>;
}
