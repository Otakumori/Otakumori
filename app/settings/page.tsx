import { generateSEO } from '@/app/lib/seo';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { AuthenticationRequiredError, requireLocalViewer } from '@/app/lib/auth/viewer';
import { isMissingSchemaError, LocalUserUnavailableError } from '@/app/lib/auth/viewer';
import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';
import { resolveServerAppOrigin } from '@/app/lib/auth/serverAppOrigin';
import { MoriArchetype, MoriArtifact, MoriSystemState } from '@/app/components/mori/MoriProduction';
import OneTapGamertagWrapper from './OneTapGamertagWrapper';

export function generateMetadata() {
  return generateSEO({
    title: 'Settings',
    description: 'Manage your Otaku-mori identity and account preferences.',
    url: '/settings',
  });
}
export default async function SettingsPage() {
  let localUserId: string;
  try {
    ({ localUserId } = await requireLocalViewer());
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      const appOrigin = await resolveServerAppOrigin();
      return (
        <MoriArchetype archetype="ritual" as="main" className="ritual-system-settings">
          <SettingsHeader />
          <MoriArtifact family="system" className="ritual-system-settings__boundary">
            <MoriSystemState
              action={<a href={buildCanonicalSignInUrl('/settings', appOrigin)} className="mori-button-primary">Sign in</a>}
              description="Sign in to manage your Otaku-mori preferences. Your return to Settings will be preserved."
              state="locked"
              title="Settings are locked"
            />
          </MoriArtifact>
        </MoriArchetype>
      );
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return <SettingsUnavailable />;
    }
    throw error;
  }

  let initial: string | undefined;
  try {
    const [me, profile] = await Promise.all([
      currentUser(),
      db.userProfile.findUnique({ where: { userId: localUserId } }),
    ]);
    initial = (profile?.gamertag ?? me?.publicMetadata?.gamertag) as string | undefined;
  } catch (error) {
    if (isMissingSchemaError(error)) return <SettingsUnavailable />;
    throw error;
  }

  return (
    <MoriArchetype archetype="ritual" as="main" className="ritual-system-settings">
      <SettingsHeader />
      <div className="ritual-system-settings__layout">
        <nav aria-label="Settings sections" className="ritual-system-settings__index">
          <p className="ritual-system-settings__index-label">System index</p>
          <a aria-current="page" href="#public-identity">Public identity</a>
        </nav>
        <MoriArtifact
          aria-labelledby="public-identity-title"
          as="section"
          family="system"
          className="ritual-system-settings__content"
          id="public-identity"
        >
          <header className="ritual-system-settings__section-heading">
            <p className="mori-foundation-eyebrow">Identity record</p>
            <h2 id="public-identity-title">Public identity</h2>
            <p>Your gamertag is visible across Otaku-mori and remains separate from sign-in.</p>
          </header>
          {initial ? (
            <OneTapGamertagWrapper initial={initial} />
          ) : (
            <MoriSystemState
              description="A public gamertag has not been assigned to this account yet."
              state="empty"
              title="No public name recorded"
            />
          )}
        </MoriArtifact>
      </div>
    </MoriArchetype>
  );
}

function SettingsHeader() {
  return (
    <header className="ritual-system-settings__hero">
      <p className="mori-foundation-eyebrow">Account system</p>
      <h1>Settings</h1>
      <p>Review the parts of your account that shape how other wanderers recognize you.</p>
    </header>
  );
}

function SettingsUnavailable() {
  return (
    <MoriArchetype archetype="ritual" as="main" className="ritual-system-settings">
      <SettingsHeader />
      <MoriArtifact family="system" className="ritual-system-settings__boundary">
        <MoriSystemState
          description="We could not load account preferences. Your account and saved settings have not been changed."
          state="unavailable"
          title="Settings are temporarily unavailable"
        />
      </MoriArtifact>
    </MoriArchetype>
  );
}
