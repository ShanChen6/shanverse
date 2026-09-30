import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function YouTubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 6.2a2.8 2.8 0 0 0-1.97-2C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.53.7a2.8 2.8 0 0 0-1.97 2A29.77 29.77 0 0 0 0 12a29.77 29.77 0 0 0 .53 5.8 2.8 2.8 0 0 0 1.97 2C4.5 20.5 12 20.5 12 20.5s7.5 0 9.53-.7a2.8 2.8 0 0 0 1.97-2A29.77 29.77 0 0 0 24 12a29.77 29.77 0 0 0-.5-5.8ZM9.75 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}
