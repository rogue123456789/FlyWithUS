import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 12h2.5a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H2" />
      <path d="M21.5 12H19a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2.5" />
      <path d="M12.5 2a.5.5 0 0 0-1 0V11l-4.5 4.5" />
      <path d="m13 15 4.5-4.5V2.5a.5.5 0 0 0-1 0V11" />
      <path d="m8.5 15.5 2.5 2.5 2.5-2.5" />
    </svg>
  );
}
