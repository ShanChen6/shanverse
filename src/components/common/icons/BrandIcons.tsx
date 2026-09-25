import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

// lucide-react (installed version) ships no brand logos, so these are hand-rolled minimal outlines.
export function GithubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-2.14c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.12 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.17v3.22c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.5 21.5v-8.2h2.75l.41-3.19h-3.16V8.08c0-.92.26-1.55 1.58-1.55h1.68V3.67c-.29-.04-1.29-.13-2.45-.13-2.43 0-4.09 1.48-4.09 4.2v2.34H7.46v3.2h2.76v8.2h3.28Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.7" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TwitterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23 4.01c-.81.36-1.68.61-2.59.72a4.52 4.52 0 0 0 1.98-2.5 9.03 9.03 0 0 1-2.87 1.1 4.51 4.51 0 0 0-7.7 4.11A12.8 12.8 0 0 1 1.64 3.16a4.51 4.51 0 0 0 1.39 6.03 4.48 4.48 0 0 1-2.04-.56v.06a4.51 4.51 0 0 0 3.62 4.42 4.52 4.52 0 0 1-2.03.08 4.51 4.51 0 0 0 4.21 3.13A9.05 9.05 0 0 1 0 19.54a12.77 12.77 0 0 0 6.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58A9.18 9.18 0 0 0 23 4.01Z" />
    </svg>
  );
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 6.2a2.8 2.8 0 0 0-1.97-2C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.53.7a2.8 2.8 0 0 0-1.97 2A29.77 29.77 0 0 0 0 12a29.77 29.77 0 0 0 .53 5.8 2.8 2.8 0 0 0 1.97 2C4.5 20.5 12 20.5 12 20.5s7.5 0 9.53-.7a2.8 2.8 0 0 0 1.97-2A29.77 29.77 0 0 0 24 12a29.77 29.77 0 0 0-.5-5.8ZM9.75 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}

export function TikTokIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 1 0 10 10h-3a7 7 0 1 1-7-7v3l4-4-4-4v3Z" />
    </svg>
  );
}
