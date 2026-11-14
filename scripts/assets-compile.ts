#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

interface PublicAssetCredit {
  kind: string;
  title: string;
  creator: string;
  license: string;
  licenseUrl?: string;
  modifications?: string;
  source: string;
}

interface CanonicalAudioCredit {
  id: string;
  title: string;
  creator: string;
  sourceUrl: string;
  licenseId: string;
  licenseUrl: string;
  modifications: string;
  publicationState: string;
  publicCredit: boolean;
}

interface CanonicalAudioAttributions {
  entries: CanonicalAudioCredit[];
}

function loadCanonicalAudioCredits(): PublicAssetCredit[] {
  const authorityPath = join(process.cwd(), 'docs', 'legal', 'audio-attributions.json');
  const authority = JSON.parse(readFileSync(authorityPath, 'utf8')) as CanonicalAudioAttributions;

  return authority.entries
    .filter(({ publicCredit }) => publicCredit)
    .map((entry) => ({
      kind: 'audio',
      title: entry.title,
      creator: entry.creator,
      license: entry.licenseId,
      licenseUrl: entry.licenseUrl,
      modifications: entry.modifications,
      source: entry.sourceUrl,
    }));
}

function loadExistingNonAudioCredits(creditsPath: string): PublicAssetCredit[] {
  if (!existsSync(creditsPath)) return [];
  const credits = JSON.parse(readFileSync(creditsPath, 'utf8')) as PublicAssetCredit[];
  return Array.isArray(credits) ? credits.filter(({ kind }) => kind !== 'audio') : [];
}

function generateCreditsJson(): void {
  const creditsPath = join(process.cwd(), 'public', 'assets', 'credits.json');
  const credits = [...loadExistingNonAudioCredits(creditsPath), ...loadCanonicalAudioCredits()];

  // Ensure directory exists
  const dir = join(process.cwd(), 'public', 'assets');
  if (!existsSync(dir)) {
    // 'Creating assets directory...'
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(creditsPath, JSON.stringify(credits, null, 2));
  // ` Generated credits.json at ${creditsPath}`
}

function validateAssetRoles(): void {
  const rolesPath = join(process.cwd(), 'assets-roles.json');

  if (!existsSync(rolesPath)) {
    console.error(' assets-roles.json not found');
    process.exit(1);
  }

  try {
    const roles = JSON.parse(readFileSync(rolesPath, 'utf8'));
    // ' assets-roles.json is valid JSON'

    // Check for required sections
    const requiredSections = ['ui', 'games', 'sections', 'cosmetics', 'fallbacks'];
    for (const section of requiredSections) {
      if (!roles[section]) {
        console.warn(`  Missing section: ${section}`);
      }
    }

    // Check for fallback assets
    if (roles.fallbacks) {
      const fallbackTypes = ['image', 'audio', 'video'];
      for (const type of fallbackTypes) {
        if (!roles.fallbacks[type]) {
          console.warn(`  Missing fallback for: ${type}`);
        }
      }
    }

    // ' Asset roles validation complete'
  } catch (error) {
    console.error(' Failed to validate assets-roles.json:', error);
    process.exit(1);
  }
}

function main(): void {
  // ' Otakumori Assets Compilation'
  // '================================\n'

  try {
    validateAssetRoles();
    generateCreditsJson();

    // '\n Assets compilation completed successfully!'
    // '\nNext steps:'
    // '1. Place actual asset files in /public/assets/'
    // '2. Update assets-roles.json with real paths'
    // '3. Verify all fallback assets exist'
    // '4. Test asset loading in development'
  } catch (error) {
    console.error('\n Assets compilation failed:', error);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
