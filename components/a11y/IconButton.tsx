import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string };
export default function IconButton({ label, children, ...rest }: Props) {
  return (
    <button aria-label={label} {...rest}>
      {children}
    </button>
  );
}
