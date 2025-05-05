import { ReactNode } from 'react';

export default function PlasmicButton({ children }: { children: ReactNode }) {
  return (
    <button className="px-4 py-2 bg-pink-500 rounded-lg text-white hover:bg-pink-600 transition">
      {children}
    </button>
  );
} 