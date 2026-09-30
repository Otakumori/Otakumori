'use client';

import { useState, type PointerEvent } from 'react';

import { MoriLineTrace, MoriSealMark } from '@/app/components/mori/MoriInteraction';
import { MoriProvisionalIcon } from '@/app/components/mori/MoriProvisionalIcon';

const traces = [
  ['Bronze structural', 'om-lab-trace--bronze', 'SITE'],
  ['Ink archive', 'om-lab-trace--ink', 'SITE'],
  ['Relic frame', 'om-lab-trace--frame', 'GAME'],
] as const;

const research = [
  ['Rope / cloth', 'Avatar ritual or a rare memory scene.', 'Native spring / SVG path when authored motion is essential.', 'Static drape and material shift.', 'WORLD MOMENT'],
  ['Constraint string', 'A tethered relic or puzzle mechanism.', 'Isolated Canvas or physics runtime after review.', 'SVG line with a single eased transform.', 'GAME / WORLD MOMENT'],
  ['Localized ripple', 'A selected pool, seal, or ritual touch point.', 'Small Canvas shader only if CSS masks fail.', 'Radial CSS opacity pulse.', 'WORLD MOMENT'],
  ['Particle attraction', 'Unlock fragments gathering into a seal.', 'Isolated WebGL only after budget review.', 'SVG dots resolving immediately.', 'WORLD MOMENT'],
  ['Fluid / metaball', 'Exceptional transformation, never routine UI.', 'Dedicated WebGL proof with hard performance budget.', 'Lacquer mask reveal.', 'LAB ONLY'],
] as const;

const contracts = [
  ['TRACE', 'Structure appears once, then settles.', 'CSS transform / SVG-safe line', 'SITE · GAME'],
  ['REVEAL', 'An object becomes available without a generic wipe.', 'CSS clip-path and layered transforms', 'GAME · WORLD MOMENT'],
  ['LIFT', 'A surface acknowledges intent without floating.', 'CSS transform and shadow', 'SITE · GAME'],
  ['SELECT', 'Choice is clear before confirmation.', 'Native buttons and small React state', 'SITE · GAME'],
  ['CONFIRM', 'Meaningful completion leaves a brief mark.', 'CSS scale / opacity', 'SITE · WORLD MOMENT'],
  ['TRANSITION', 'A local composition changes without navigation interception.', 'CSS overlay simulation', 'LAB ONLY'],
] as const;

export function InteractionLab() {
  const [selected, setSelected] = useState('Archive');
  const [confirmation, setConfirmation] = useState<'rest' | 'seal' | 'ink' | 'ivory'>('rest');
  const [transition, setTransition] = useState<'aperture' | 'passage' | null>(null);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const reveal = (kind: string) => setRevealed((current) => ({ ...current, [kind]: !current[kind] }));

  const setRelicTilt = (event: PointerEvent<HTMLButtonElement>) => {
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    target.style.setProperty('--om-lab-tilt-x', `${Math.max(-3, Math.min(3, -y * 6))}deg`);
    target.style.setProperty('--om-lab-tilt-y', `${Math.max(-3, Math.min(3, x * 6))}deg`);
  };

  const resetRelicTilt = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty('--om-lab-tilt-x', '0deg');
    event.currentTarget.style.setProperty('--om-lab-tilt-y', '0deg');
  };

  return (
    <section aria-labelledby="interaction-lab-title" className="om-interaction-lab mt-16">
      <header className="om-lab-intro">
        <p className="mori-foundation-eyebrow">Internal review only · interaction language</p>
        <h2 className="mori-foundation-heading" id="interaction-lab-title">Six verbs, held with restraint.</h2>
        <p className="mori-foundation-description">
          These specimens test meaning, input parity, and motion boundaries. They are not enabled on
          production routes by this lab.
        </p>
      </header>

      <div className="om-lab-contracts" aria-label="Interaction primitive contracts">
        {contracts.map(([verb, rest, method, suitability]) => (
          <article className="om-lab-contract" key={verb}>
            <p className="om-lab-contract__verb">{verb}</p>
            <p>{rest}</p>
            <small>{method} · {suitability}</small>
          </article>
        ))}
      </div>

      <section aria-labelledby="trace-title" className="om-lab-section">
        <div className="om-lab-section__heading">
          <p className="om-lab-kicker">TRACE · site / relic</p>
          <h3 id="trace-title">A line should explain, not decorate.</h3>
        </div>
        <div className="om-lab-three-up">
          {traces.map(([label, className, suitability]) => (
            <article className="om-lab-specimen" key={label}>
              <span className="om-lab-suitability">{suitability}</span>
              <div className={className} aria-hidden="true"><span /></div>
              <h4>{label}</h4>
              <p>Rest: quiet geometry. Hover/focus: final structural state remains visible. Reduced motion: immediate final line.</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="reveal-title" className="om-lab-section">
        <div className="om-lab-section__heading">
          <p className="om-lab-kicker">REVEAL · selected object only</p>
          <h3 id="reveal-title">Reveal through an aperture, not a slideshow wipe.</h3>
        </div>
        <div className="om-lab-three-up">
          {[
            ['clip', 'Asymmetric aperture'],
            ['depth', 'Double-layer depth'],
            ['lacquer', 'Lacquer / ink recede'],
          ].map(([kind, label]) => {
            const active = revealed[kind];
            return (
              <article className="om-lab-specimen" key={kind}>
                <div className={`om-lab-reveal om-lab-reveal--${kind} ${active ? 'is-revealed' : ''}`}>
                  <MoriProvisionalIcon aria-hidden="true" name="home" size={50} />
                  <span className="om-lab-reveal__backdrop" aria-hidden="true" />
                  <span className="om-lab-reveal__veil" aria-hidden="true" />
                </div>
                <h4>{label}</h4>
                <button className="mori-foundation-button" onClick={() => reveal(kind)} type="button">
                  {active ? 'Reset reveal' : 'Preview reveal'}
                </button>
                <p>Use: game art, rare collection unlocks, memories, or a chosen editorial moment. Touch and keyboard use the same control.</p>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="lift-title" className="om-lab-section">
        <div className="om-lab-section__heading">
          <p className="om-lab-kicker">LIFT · site versus game</p>
          <h3 id="lift-title">Material lift is quiet. Relic tilt is earned.</h3>
        </div>
        <div className="om-lab-two-up">
          <article className="om-lab-specimen">
            <button className="om-lab-material-lift" type="button"><MoriProvisionalIcon name="filter" size={22} /> Material lift</button>
            <p>Site primitive: 2px elevation, no perspective, visible focus, and no hover-only meaning.</p>
          </article>
          <article className="om-lab-specimen">
            <button
              className="om-lab-game-relic"
              onPointerLeave={resetRelicTilt}
              onPointerMove={setRelicTilt}
              type="button"
            >
              <MoriProvisionalIcon name="orders" size={36} /><span>Game relic</span>
            </button>
            <p>Game-only: shallow pointer perspective and stronger focus state. Touch selects; reduced motion keeps the selected prominence without tilt.</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="select-title" className="om-lab-section">
        <div className="om-lab-section__heading">
          <p className="om-lab-kicker">SELECT · quiet site primitive</p>
          <h3 id="select-title">Selection is a material decision, not a glow.</h3>
        </div>
        <div aria-label="Archive category" className="om-lab-quiet-select" role="group">
          {['Archive', 'Relics', 'Letters'].map((option) => (
            <button
              aria-pressed={selected === option}
              className={selected === option ? 'is-selected' : ''}
              key={option}
              onClick={() => setSelected(option)}
              type="button"
            >
              <span aria-hidden="true" className="om-lab-quiet-select__mark" />{option}
            </button>
          ))}
        </div>
        <p className="om-lab-selection-readout" role="status">Selected archive: {selected}</p>
        <p className="om-lab-note">The production Mini-Games selector remains the game proof: keyboard arrows, Home/End, click, and 32px touch swipe. This quiet variant deliberately has no tilt or inertia.</p>
      </section>

      <section aria-labelledby="confirm-title" className="om-lab-section">
        <div className="om-lab-section__heading">
          <p className="om-lab-kicker">CONFIRM · meaningful completion</p>
          <h3 id="confirm-title">Ceremony belongs to an outcome, not every click.</h3>
        </div>
        <div className="om-lab-confirmations">
          {[
            ['seal', 'Seal / stamp'],
            ['ink', 'Ink confirmation'],
            ['ivory', 'Ivory revelation'],
          ].map(([kind, label]) => (
            <button className={`om-lab-confirm om-lab-confirm--${kind} ${confirmation === kind ? 'is-confirmed' : ''}`} key={kind} onClick={() => setConfirmation(kind as typeof confirmation)} type="button">
              {kind === 'seal' ? <MoriSealMark /> : <span aria-hidden="true" className="om-lab-confirm__glyph" />}
              <span>{label}</span>
            </button>
          ))}
        </div>
        <p className="om-lab-selection-readout" role="status">{confirmation === 'rest' ? 'Choose a confirmation expression.' : `${confirmation} confirmation previewed.`}</p>
      </section>

      <section aria-labelledby="transition-title" className="om-lab-section">
        <div className="om-lab-section__heading">
          <p className="om-lab-kicker">TRANSITION · lab simulation</p>
          <h3 id="transition-title">A passage may frame a scene; it must never block comprehension.</h3>
        </div>
        <div className="om-lab-transition-stage" data-transition={transition ?? 'rest'}>
          <p>Static composition remains legible throughout.</p>
          <span aria-hidden="true" className="om-lab-transition-stage__aperture" />
          <span aria-hidden="true" className="om-lab-transition-stage__passage">✦</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="mori-foundation-button" onClick={() => setTransition('aperture')} type="button">Relic aperture</button>
          <button className="mori-foundation-button" onClick={() => setTransition('passage')} type="button">Sakura / ink passage</button>
          <button className="mori-foundation-button" onClick={() => setTransition(null)} type="button">Reset</button>
        </div>
      </section>

      <section aria-labelledby="ambient-title" className="om-lab-section">
        <div className="om-lab-section__heading">
          <p className="om-lab-kicker">DRIFT · BREATHE · SETTLE</p>
          <h3 id="ambient-title">Ambient motion yields to important UI.</h3>
        </div>
        <div className="om-lab-ambient" aria-label="Ambient motion proof">
          <span className="om-lab-ambient__petal" aria-hidden="true">✦</span>
          <MoriLineTrace />
          <p>One isolated Sakura-pigment signal drifts; the structural trace and all controls settle. Reduced motion renders the final positions.</p>
        </div>
      </section>

      <section aria-labelledby="hud-title" className="om-lab-section">
        <div className="om-lab-section__heading"><p className="om-lab-kicker">GAME / RELIC ONLY</p><h3 id="hud-title">In-game HUD specimen</h3></div>
        <div className="om-lab-hud">
          <div><p className="om-lab-hud__label">Memory / focus</p><div aria-label="Memory 72 percent" className="om-lab-hud__gauge"><span style={{ width: '72%' }} /></div></div>
          <MoriSealMark label="Relic status" />
          <button className="om-lab-hud__relic" type="button"><MoriProvisionalIcon name="wishlist" size={30} /><span>Selected relic</span></button>
        </div>
      </section>

      <section aria-labelledby="research-title" className="om-lab-section om-lab-section--research">
        <div className="om-lab-section__heading"><p className="om-lab-kicker">GAME / WORLD MOMENT ONLY</p><h3 id="research-title">Physics research zone</h3></div>
        <div className="om-lab-research-grid">
          {research.map(([name, purpose, ideal, fallback, suitability]) => (
            <article key={name}><p className="om-lab-suitability">{suitability}</p><h4>{name}</h4><p>{purpose}</p><dl><dt>Ideal</dt><dd>{ideal}</dd><dt>Safe alternative</dt><dd>{fallback}</dd><dt>Mobile / motion</dt><dd>Opt in only; static final geometry for reduced motion.</dd></dl></article>
          ))}
        </div>
      </section>
    </section>
  );
}
