import {
  MoriButton,
  MoriDivider,
  MoriFrame,
  MoriSectionHeader,
  MoriStatus,
  MoriSurface,
} from '@/app/components/mori/MoriFoundation';
import { MoriLineTrace, MoriSealMark } from '@/app/components/mori/MoriInteraction';
import { MoriProvisionalIcon } from '@/app/components/mori/MoriProvisionalIcon';

const icons = ['home', 'search', 'cart', 'wishlist', 'orders', 'community', 'settings'] as const;

/** Internal visual-system playground composed from real production primitives. */
export default function VisualSystemPage() {
  return (
    <main className="om-route-page om-route-page--lab px-5 pb-20 pt-28 sm:px-8">
      <div className="om-visual-lab">
        <MoriSectionHeader
          description="A live specimen of typography, containment, controls, and motion constraints. It is an internal QA surface, not a new route identity."
          eyebrow="Otaku-mori · system specimen"
          headingLevel={1}
          title="Material & Motif Lab"
        />
        <MoriLineTrace className="my-8" />

        <div className="om-visual-lab__grid">
          <MoriSurface className="om-visual-lab__sample om-surface--field" material="paper">
            <p className="mori-foundation-eyebrow">Environmental placement</p>
            <h2 className="mori-foundation-heading">Typography carries the room.</h2>
            <p className="mori-foundation-description">
              No card is needed when spacing, linework, and hierarchy make the relationship clear.
            </p>
          </MoriSurface>

          <MoriSurface className="om-visual-lab__sample om-surface--material" material="paper">
            <p className="mori-foundation-eyebrow">Material region</p>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#d9cdbd]">
              Charcoal paper changes the local reading without elevating the content into a generic
              application panel.
            </p>
          </MoriSurface>

          <MoriFrame className="om-visual-lab__sample om-surface--relic">
            <p className="mori-foundation-eyebrow">Framed object</p>
            <div className="mt-7 flex items-center gap-4">
              <MoriSealMark label="Archive seal" />
              <p className="max-w-sm text-sm leading-6 text-[#d9cdbd]">
                Interrupted bronze geometry is reserved for an object, record, or rare moment.
              </p>
            </div>
          </MoriFrame>

          <MoriSurface
            className="om-visual-lab__sample om-surface--chamber"
            containment="none"
            material="lacquer"
          >
            <p className="mori-foundation-eyebrow">Functional chamber</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <MoriButton>Archive action</MoriButton>
              <MoriButton variant="secondary">Quiet action</MoriButton>
              <MoriButton data-mori-selected="true" variant="secondary">
                Selected state
              </MoriButton>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <MoriStatus>Record</MoriStatus>
              <MoriStatus tone="selected">Remembered</MoriStatus>
              <MoriStatus tone="error">Interrupted</MoriStatus>
            </div>
          </MoriSurface>
        </div>

        <MoriDivider label="Navigation glyphs" />
        <div className="mt-6 flex flex-wrap gap-6" aria-label="Provisional navigation icon specimen">
          {icons.map((icon) => (
            <div className="flex flex-col items-center gap-2" key={icon}>
              <MoriProvisionalIcon name={icon} size={28} />
              <span className="font-ui text-[0.65rem] uppercase tracking-[0.16em] text-[#c6a77d]">
                {icon}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
