import type { SVGProps } from "react";

/** Neutral shaded parts match the shape catalogue; openings show the actual profile. */
export function TechnicModuleIcon({ kind, ...props }: SVGProps<SVGSVGElement> & {
  kind: "builder" | "solid" | "pin" | "axle";
}) {
  return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...props}>
    {kind === "builder" ? <g transform="matrix(1 -.4 0 1 9 24)" stroke="#777" strokeWidth="0.6" strokeLinejoin="round">
      <path d="M1 -8H25A6 6 0 0 1 31 -2L36 6A6 6 0 0 1 30 12H6A6 6 0 0 1 0 6L-5 -2A6 6 0 0 1 1 -8Z" fill="#aaa" />
      <path d="M1 -8H25A6 6 0 0 1 31 -2L36 6A6 6 0 0 0 30 0H6Z" fill="#d3d3d3" />
      <rect width="36" height="12" rx="6" fill="#e3e3e3" />
      {[6, 18, 30].map(cx => <g key={cx}>
        <circle cx={cx} cy="6" r="4.9" fill="#aaa" stroke="#f8f8f8" strokeWidth="0.7" />
        <circle cx={cx} cy="6" r="3.8" fill="#454545" stroke="#d8d8d8" strokeWidth="0.5" />
      </g>)}
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
