'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { MoriButton } from './MoriFoundation';
import { MoriArchetype, MoriArtifact } from './MoriProduction';

export type MoriGameMetric = {
  label: string;
  value: ReactNode;
  emphasis?: 'normal' | 'selected' | 'warning';
};

export function MoriGameThreshold({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <MoriArchetype
      archetype="game-threshold"
      as="section"
      aria-label={label}
      className={cn('mori-game-threshold', className)}
    >
      {children}
    </MoriArchetype>
  );
}

export function MoriGameHud({
  className,
  metrics,
  progress,
  progressLabel = 'Progress',
}: {
  className?: string;
  metrics: MoriGameMetric[];
  progress?: number;
  progressLabel?: string;
}) {
  const progressId = useId();
  const boundedProgress = progress === undefined ? undefined : Math.min(1, Math.max(0, progress));

  return (
    <MoriArtifact
      as="aside"
      aria-label="Game status"
      className={cn('mori-game-hud', className)}
      family="game"
    >
      <dl className="mori-game-hud__metrics">
        {metrics.map((metric) => (
          <div data-mori-emphasis={metric.emphasis ?? 'normal'} key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>
      {boundedProgress === undefined ? null : (
        <div className="mori-game-hud__progress">
          <label htmlFor={progressId}>{progressLabel}</label>
          <progress id={progressId} max={1} value={boundedProgress} />
        </div>
      )}
    </MoriArtifact>
  );
}

export function MoriGameOverlay({
  children,
  className,
  description,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel,
  state,
  title,
}: {
  children?: ReactNode;
  className?: string;
  description?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  primaryLabel: string;
  secondaryLabel?: string;
  state: 'pause' | 'reward' | 'results';
  title: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `mori-game-${state}-${useId()}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const containFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('hidden'));
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog.addEventListener('keydown', containFocus);

    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    }

    dialog.querySelector<HTMLButtonElement>('button')?.focus();

    return () => {
      dialog.removeEventListener('keydown', containFocus);
      if (dialog.open && typeof dialog.close === 'function') {
        dialog.close();
      }
    };
  }, []);

  return (
    <dialog
      aria-labelledby={titleId}
      aria-modal="true"
      className={cn('mori-game-overlay', className)}
      data-mori-game-state={state}
      onCancel={(event) => {
        event.preventDefault();
        onPrimary();
      }}
      ref={dialogRef}
    >
      <MoriArtifact className="mori-game-overlay__panel" family="game">
        <span aria-hidden="true" className="mori-game-overlay__index" />
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
        {children}
        <div className="mori-game-overlay__actions">
          <MoriButton onClick={onPrimary}>{primaryLabel}</MoriButton>
          {onSecondary && secondaryLabel ? (
            <MoriButton onClick={onSecondary} variant="secondary">
              {secondaryLabel}
            </MoriButton>
          ) : null}
        </div>
      </MoriArtifact>
    </dialog>
  );
}
