'use client';
import { type ReactNode, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import './section.css';

interface SectionShellProps {
  title: string;
  subtitle?: string;
  artwork?: string;
  onBack?: () => void;
  children: ReactNode;
}

export default function SectionShell({
  title,
  subtitle,
  artwork,
  onBack,
  children,
}: SectionShellProps) {
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
        {artwork && (
          <div className="section-destination-art" aria-hidden="true">
            <Image src={artwork} alt="" fill sizes="7rem" className="object-contain" />
          </div>
        )}
      </div>
      <div className="section-frame">
        <div className="section-canvas">{children}</div>
      </div>
    </div>
  );
}
