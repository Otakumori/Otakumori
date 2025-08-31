/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './section.css';

interface SectionShellProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
}

export default function SectionShell({ title, subtitle, onBack, children }: SectionShellProps) {
  const router = useRouter();

  useEffect(() => {
    // Prevent body scroll-jump during zoom
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = '';
    };
  }, []);

  return (
    <div className="section-root">
      <div className="section-status">
        <button
          className="section-back"
          aria-label="Back"
          onClick={() => (onBack ? onBack() : router.back())}
        >
          ←
        </button>
        <div className="section-titles">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div className="section-frame">
        <div className="section-canvas">{children}</div>
      </div>
    </div>
  );
}
