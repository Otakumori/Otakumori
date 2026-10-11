import Link from 'next/link';
import type { ReactNode } from 'react';

import { MoriArchetype, MoriArtifact } from '@/app/components/mori/MoriProduction';
import { paths } from '@/lib/paths';
import { cn } from '@/lib/utils';

export type CommanderArchiveSection = 'profile' | 'orders' | 'achievements';

const archiveSections: Array<{
  id: CommanderArchiveSection;
  href: string;
  label: string;
}> = [
  { id: 'profile', href: paths.profile(), label: 'Profile' },
  { id: 'orders', href: paths.orders(), label: 'Orders' },
  { id: 'achievements', href: paths.achievements(), label: 'Achievements' },
];

export function CommanderArchiveShell({
  children,
  className,
  current,
}: {
  children: ReactNode;
  className?: string;
  current: CommanderArchiveSection;
}) {
  return (
    <MoriArchetype
      as="main"
      archetype="commander"
      className={cn('commander-archive min-h-screen pt-24', className)}
    >
      <div className="commander-archive__continuity">
        <p className="commander-archive__name">Commander Archive</p>
        <nav aria-label="Commander archive">
          <ul className="commander-archive__nav-list">
            {archiveSections.map((section) => (
              <li key={section.id}>
                <Link
                  aria-current={current === section.id ? 'page' : undefined}
                  className="commander-archive__nav-link"
                  href={section.href}
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mori-archetype__flow commander-archive__flow">{children}</div>
    </MoriArchetype>
  );
}

export function CommanderArchiveHeading({
  artwork,
  description,
  title,
}: {
  artwork?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <MoriArtifact as="section" family="commander" className="commander-archive__heading">
      <div className="commander-archive__heading-copy">
        <p className="mori-foundation-eyebrow">Personal record</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {artwork ? <div className="commander-archive__heading-art">{artwork}</div> : null}
    </MoriArtifact>
  );
}
