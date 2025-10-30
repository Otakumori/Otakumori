#!/usr/bin/env node

/**
 * SEO Audit Script
 *
 * Crawls top routes and validates:
 * - Title (40-60 chars)
 * - Description (120-160 chars)
 * - Single H1
 * - Canonical URL
 * - Open Graph tags
 */

import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';

interface SEOCheck {
  route: string;
  title: {
    present: boolean;
    length: number;
    valid: boolean;
    content?: string;
  };
  description: {
    present: boolean;
    length: number;
    valid: boolean;
    content?: string;
  };
  h1: {
    count: number;
    valid: boolean;
    content?: string[];
  };
  canonical: {
    present: boolean;
    url?: string;
  };
  openGraph: {
    title: boolean;
    description: boolean;
    image: boolean;
    type: boolean;
  };
  jsonLd: {
    present: boolean;
    types: string[];
  };
}

const TARGET_ROUTES = ['/', '/mini-games', '/shop', '/blog', '/about', '/terms', '/privacy'];

class SEOAuditor {
  private results: SEOCheck[] = [];
  private errors: string[] = [];
  private warnings: string[] = [];

  async audit(): Promise<boolean> {
    // '⌕ Starting SEO audit...'

    for (const route of TARGET_ROUTES) {
      try {
        // `\n Auditing ${route}...`
        const result = await this.auditRoute(route);
        this.results.push(result);
        this.validateResult(result);
      } catch (error) {
        this.errors.push(` Failed to audit ${route}: ${error}`);
      }
    }

    this.printResults();
    return this.errors.length === 0;
  }

  private async auditRoute(route: string): Promise<SEOCheck> {
    // For this implementation, we'll check built HTML files
    // In a real scenario, you'd fetch from a running server
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
    // Map routes to their built HTML files
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
      routeMap[route] || `${route.slice(1)}.html`,
    );
  }

  private async getHtmlContent(htmlPath: string): Promise<string> {
    try {
      return await fs.readFile(htmlPath, 'utf-8');
    } catch (error) {
      // Fallback: check if it's a dynamic route or different structure
      throw new Error(`HTML file not found: ${htmlPath}`);
    }
  }

  private checkTitle(document: Document): SEOCheck['title'] {
    const titleElement = document.querySelector('title');
    const content = titleElement?.textContent?.trim() || '';

    return {
      present: !!titleElement,
      length: content.length,
      valid: content.length >= 40 && content.length <= 60,
      content,
    };
  }

  private checkDescription(document: Document): SEOCheck['description'] {
    const metaDesc = document.querySelector('meta[name=\"description\"]') as HTMLMetaElement;
    const content = metaDesc?.content?.trim() || '';

    return {
      present: !!metaDesc,
      length: content.length,
      valid: content.length >= 120 && content.length <= 160,
      content,
    };
  }

  private checkH1(document: Document): SEOCheck['h1'] {
    const h1Elements = document.querySelectorAll('h1');
    const content = Array.from(h1Elements).map((h1) => h1.textContent?.trim() || '');

    return {
      count: h1Elements.length,
      valid: h1Elements.length === 1,
      content,
    };
  }

  private checkCanonical(document: Document): SEOCheck['canonical'] {
    const canonicalElement = document.querySelector('link[rel=\"canonical\"]') as HTMLLinkElement;

    return {
      present: !!canonicalElement,
      url: canonicalElement?.href,
    };
  }

  private checkOpenGraph(document: Document): SEOCheck['openGraph'] {
    return {
      title: !!document.querySelector('meta[property=\"og:title\"]'),
      description: !!document.querySelector('meta[property=\"og:description\"]'),
      image: !!document.querySelector('meta[property=\"og:image\"]'),
      type: !!document.querySelector('meta[property=\"og:type\"]'),
    };
  }

  private checkJsonLd(document: Document): SEOCheck['jsonLd'] {
    const scripts = document.querySelectorAll('script[type=\"application/ld+json\"]');
    const types: string[] = [];

    scripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@type']) {
          types.push(data['@type']);
        }
      } catch (error) {
        // Invalid JSON-LD
      }
    });

    return {
      present: scripts.length > 0,
      types,
    };
  }

  private validateResult(result: SEOCheck): void {
    const route = result.route;

    // Title validation
    if (!result.title.present) {
      this.errors.push(` ${route}: Missing title tag`);
    } else if (!result.title.valid) {
      this.warnings.push(
        `  ${route}: Title length ${result.title.length} chars (should be 40-60)`,
      );
    }

    // Description validation
    if (!result.description.present) {
      this.errors.push(` ${route}: Missing meta description`);
    } else if (!result.description.valid) {
      this.warnings.push(
        `  ${route}: Description length ${result.description.length} chars (should be 120-160)`,
      );
    }

    // H1 validation
    if (!result.h1.valid) {
      if (result.h1.count === 0) {
        this.errors.push(` ${route}: Missing H1 tag`);
      } else if (result.h1.count > 1) {
        this.errors.push(` ${route}: Multiple H1 tags (${result.h1.count})`);
      }
    }

    // Canonical validation
    if (!result.canonical.present) {
      this.warnings.push(`  ${route}: Missing canonical URL`);
    }

    // Open Graph validation
    const og = result.openGraph;
    if (!og.title) this.warnings.push(`  ${route}: Missing og:title`);
    if (!og.description) this.warnings.push(`  ${route}: Missing og:description`);
    if (!og.image) this.warnings.push(`  ${route}: Missing og:image`);
    if (!og.type) this.warnings.push(`  ${route}: Missing og:type`);

    // JSON-LD validation for key pages
    if (['/shop', '/mini-games', '/'].includes(route) && !result.jsonLd.present) {
      this.warnings.push(`  ${route}: Missing JSON-LD structured data`);
    }
  }

  private printResults(): void {
    // '\n SEO Audit Results:'
    // '========================'

    this.results.forEach((result) => {
      // `\n ${result.route}`
      // `   Title: ${result.title.present ? '' : ''} (${result.title.length} chars`);
      // `   Description: ${result.description.present ? '' : ''} (${result.description.length} chars`
      // `   H1: ${result.h1.valid ? '' : ''} (${result.h1.count} found`);
      // `   Canonical: ${result.canonical.present ? '' : ''}`
      // `   Open Graph: ${Object.values(result.openGraph.filter(Boolean).length}/4 tags`
      // `   JSON-LD: ${result.jsonLd.present ? '' : ''} (${result.jsonLd.types.join(', ')}`
    });

    if (this.warnings.length > 0) {
      // '\n  Warnings:'
      this.warnings.forEach((warning) => {
        // warning
      });
    }

    if (this.errors.length > 0) {
      // '\n Errors:'
      this.errors.forEach((error) => {
        // error
      });
      // `\n SEO audit failed with ${this.errors.length} errors!`
    } else {
      // '\n SEO audit passed!'
    }

    // Summary stats
    const totalIssues = this.errors.length + this.warnings.length;
    const scorePercentage = Math.max(
      0,
      Math.round(((this.results.length * 6 - totalIssues) / (this.results.length * 6)) * 100),
    );
    // `\n SEO Score: ${scorePercentage}%`
  }
}

async function main() {
  try {
    const auditor = new SEOAuditor();
    const success = await auditor.audit();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error(' SEO audit script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { SEOAuditor };
