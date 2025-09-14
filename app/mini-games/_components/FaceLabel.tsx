"use client";
import Link from 'next/link';

export default function FaceLabel({
  id,
  label,
  href,
  active,
}: {
  id: string;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      id={id}
      href={href}
      role="option"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={`pointer-events-auto rounded-full bg-white/10 px-3 py-1 text-sm text-white/90 outline-none ring-2 ring-transparent focus:ring-pink-500 ${active ? 'bg-pink-500/30' : ''}`}
    >
      {label}
    </Link>
  );
}

