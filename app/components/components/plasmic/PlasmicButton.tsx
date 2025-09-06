import { type ReactNode } from 'react';

export default function PlasmicButton({ children }: { children: ReactNode }) {
  return (
    <button className="rounded-lg bg-pink-500 px-4 py-2 text-white transition hover:bg-pink-600">
      {children}
    </button>
  );
}
