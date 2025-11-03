#!/usr/bin/env node

/**
 * SEO Audit Script
 *
 * Validates key metadata across key static routes:
 *   • Title length between 40–60 characters
 *   • Meta description length between 120–160 characters
 *   • Exactly one H1 tag
 *   • Canonical URL present
 *   • Open Graph tags present
 *   • JSON-LD structured data on high-value routes
 *
 * Usage: pnpm tsx scripts/seo-audit.ts
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

interface SEOCheck {
  route: string;
  title: { present: boolean; length: number; valid: boolean; content?: string };
  description: { present: boolean; length: number; valid: boolean; content?: string };
  h1: { count: number; valid: boolean; content: string[] };
  canonical: { present: boolean; url?: string };
  openGraph: { title: boolean; description: boolean; image: boolean; type: boolean };
  jsonLd: { present: boolean; types: string[] };
}

const TARGET_ROUTES = ['/', '/mini-games', '/shop', '/blog', '/about', '/terms', '/privacy'];

class SEOAuditor {
  private results: SEOCheck[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];

  async audit(): Promise<boolean> {
    console.warn('Starting SEO audit…');

    for (const route of TARGET_ROUTES) {
      try {
        const result = await this.auditRoute(route);
        this.results.push(result);
        this.validateResult(result);
      } catch (error) {
        this.errors.push(`Failed to audit ${route}: ${String(error)}`);
      }
    }

    this.printResults();
    return this.errors.length === 0;
  }

  private async auditRoute(route: string): Promise<SEOCheck> {
    const htmlPath = this.getHtmlPath(route);
    const htmlContent = await this.getHtmlContent(htmlPath);
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    return {
      route,
      title: this.checkTitle(document),
      description: this.checkDescription(document),
      h1: this.checkH1(document),
      canonical: this.checkCanonical(document),
      openGraph: this.checkOpenGraph(document),
      jsonLd: this.checkJsonLd(document),
    };
  }

  private getHtmlPath(route: string): string {
    const routeMap: Record<string, string> = {
      '/': 'index.html',
      '/mini-games': 'mini-games.html',
      '/shop': 'shop.html',
      '/blog': 'blog.html',
      '/about': 'about.html',
      '/terms': 'terms.html',
      '/privacy': 'privacy.html',
    };

    return path.join(
      process.cwd(),
      '.next/server/app',
      routeMap[route] ?? `${route.slice(1)}.html`,
    );
  }

  private async getHtmlContent(htmlPath: string): Promise<string> {
    try {
      return await fs.readFile(htmlPath, 'utf-8');
    } catch (error) {
      throw new Error(`HTML file not found: ${htmlPath}`, { cause: error });
    }
  }

  private checkTitle(document: Document): SEOCheck['title'] {
    const titleElement = document.querySelector('title');
    const content = titleElement?.textContent?.trim() ?? '';
    return {
      present: Boolean(titleElement),
      length: content.length,
      valid: content.length >= 40 && content.length <= 60,
      content,
    };
  }

  private checkDescription(document: Document): SEOCheck['description'] {
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const content = metaDesc?.content?.trim() ?? '';
    return {
      present: Boolean(metaDesc),
      length: content.length,
      valid: content.length >= 120 && content.length <= 160,
      content,
    };
  }

  private checkH1(document: Document): SEOCheck['h1'] {
    const h1Elements = Array.from(document.querySelectorAll('h1'));
    const content = h1Elements.map((h1) => h1.textContent?.trim() ?? '').filter(Boolean);
    return {
      count: h1Elements.length,
      valid: h1Elements.length === 1,
      content,
    };
  }

  private checkCanonical(document: Document): SEOCheck['canonical'] {
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    return { present: Boolean(canonical), url: canonical?.href };
  }

  private checkOpenGraph(document: Document): SEOCheck['openGraph'] {
    return {
      title: Boolean(document.querySelector('meta[property="og:title"]')),
      description: Boolean(document.querySelector('meta[property="og:description"]')),
      image: Boolean(document.querySelector('meta[property="og:image"]')),
      type: Boolean(document.querySelector('meta[property="og:type"]')),
    };
  }

  private checkJsonLd(document: Document): SEOCheck['jsonLd'] {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    const types: string[] = [];

    scripts.forEach((script) => {
      try {
        const payload = JSON.parse(script.textContent || '{}');
        const type = payload['@type'];
        if (typeof type === 'string') {
          types.push(type);
        }
      } catch {
        console.error('Invalid JSON-LD block encountered.');
      }
    });

    return { present: scripts.length > 0, types };
  }

  private validateResult(result: SEOCheck): void {
    const route = result.route;

    if (!result.title.present) {
      this.errors.push(`${route}: Missing title tag`);
    } else if (!result.title.valid) {
      this.warnings.push(
        `${route}: Title length ${result.title.length} chars (expected 40–60 characters)`,
      );
    }

    if (!result.description.present) {
      this.errors.push(`${route}: Missing meta description`);
    } else if (!result.description.valid) {
      this.warnings.push(
        `${route}: Description length ${result.description.length} chars (expected 120–160 characters)`,
      );
    }

    if (!result.h1.valid) {
      this.errors.push(
        result.h1.count === 0
          ? `${route}: Missing H1 tag`
          : `${route}: Multiple H1 tags detected (${result.h1.count})`,
      );
    }

    if (!result.canonical.present) {
      this.warnings.push(`${route}: Missing canonical URL`);
    }

    const og = result.openGraph;
    if (!og.title) this.warnings.push(`${route}: Missing og:title`);
    if (!og.description) this.warnings.push(`${route}: Missing og:description`);
    if (!og.image) this.warnings.push(`${route}: Missing og:image`);
    if (!og.type) this.warnings.push(`${route}: Missing og:type`);

    if (['/shop', '/mini-games', '/'].includes(route) && !result.jsonLd.present) {
      this.warnings.push(`${route}: Missing JSON-LD structured data`);
    }
  }

  private printResults(): void {
    const lines: string[] = [];
    const divider = '='.repeat(60);

    lines.push('');
    lines.push(divider);
    lines.push('SEO Audit Results');
    lines.push(divider);

    for (const result of this.results) {
      lines.push('');
      lines.push(result.route);
      lines.push(
        `  Title: ${result.title.present ? 'present' : 'missing'} (${result.title.length} chars)`,
      );
      lines.push(
        `  Description: ${result.description.present ? 'present' : 'missing'} (${result.description.length} chars)`,
      );
      lines.push(`  H1 tags: ${result.h1.count} (${result.h1.valid ? 'valid' : 'needs review'})`);
      lines.push(`  Canonical: ${result.canonical.present ? 'present' : 'missing'}`);
      const ogCount = Object.values(result.openGraph).filter(Boolean).length;
      lines.push(`  Open Graph: ${ogCount}/4 tags present`);
      lines.push(
        `  JSON-LD: ${result.jsonLd.present ? 'present' : 'missing'}${
          result.jsonLd.types.length ? ` – ${result.jsonLd.types.join(', ')}` : ''
        }`,
      );
    }

    console.warn(lines.join('\n'));

    if (this.warnings.length > 0) {
      console.warn('\nWarnings:');
      this.warnings.forEach((warning) => console.warn(`  • ${warning}`));
    }

    if (this.errors.length > 0) {
      console.error('\nErrors:');
      this.errors.forEach((auditError) => console.error(`  • ${auditError}`));
      console.error(`\nSEO audit failed with ${this.errors.length} blocking issues.`);
    } else {
      console.warn('\nSEO audit passed without critical errors ✅');
    }

    const totalChecks = Math.max(this.results.length * 6, 1);
    const totalIssues = this.errors.length + this.warnings.length;
    const scorePercentage = Math.max(
      0,
      Math.round(((totalChecks - totalIssues) / totalChecks) * 100),
    );

    console.warn(
      `\nSEO Score: ${scorePercentage}% (${totalIssues} issues across ${this.results.length} routes)`,
    );
  }
}

async function main(): Promise<void> {
  try {
    const auditor = new SEOAuditor();
    const success = await auditor.audit();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('SEO audit script failed:', error);
    process.exit(1);
  }
}

const entryHref = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entryHref) {
  void main();
}

export { SEOAuditor };
