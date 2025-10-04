#!/usr/bin/env tsx

/**
 * Pre-build validation script to catch common issues before they cause build failures
 * Run this before any build to ensure everything is ready
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

// Simple glob function
function glob(pattern: string, baseDir: string = '.'): string[] {
  const results: string[] = [];

  function walkDir(dir: string, pattern: string) {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath, pattern);
      } else if (stat.isFile()) {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        if (matchesPattern(relativePath, pattern)) {
          results.push(relativePath);
        }
      }
    }
  }

  function matchesPattern(filePath: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
    return regex.test(filePath);
  }

  walkDir(baseDir, pattern);
  return results;
}

class PreBuildValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  async validate(): Promise<ValidationResult> {
    console.log('⌕ Running pre-build validation...\n');

    // 1. TypeScript compilation check
    await this.checkTypeScript();

    // 2. Prisma schema validation
    await this.checkPrismaSchema();

    // 3. Import path validation
    await this.checkImportPaths();

    // 4. Missing component validation
    await this.checkMissingComponents();

    // 5. Type consistency validation
    await this.checkTypeConsistency();

    // 6. Environment variable validation
    await this.checkEnvironmentVariables();

    const success = this.errors.length === 0;

    if (this.warnings.length > 0) {
      console.log('\n  Warnings:');
      this.warnings.forEach((warning) => console.log(`  - ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\n Errors:');
      this.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (success) {
      console.log('\n All validations passed! Ready to build.');
    } else {
      console.log('\n Validation failed. Fix errors before building.');
    }

    return { success, errors: this.errors, warnings: this.warnings };
  }

  private async checkTypeScript(): Promise<void> {
    console.log(' Checking TypeScript compilation...');
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('   TypeScript compilation OK');
    } catch (error) {
      const output = error instanceof Error ? error.message : String(error);
      this.errors.push(`TypeScript compilation failed: ${output}`);
    }
  }

  private async checkPrismaSchema(): Promise<void> {
    console.log('️  Checking Prisma schema...');
    try {
      execSync('npx prisma validate', { stdio: 'pipe' });
      console.log('   Prisma schema valid');
    } catch (error) {
      const output = error instanceof Error ? error.message : String(error);
      this.errors.push(`Prisma schema validation failed: ${output}`);
    }
  }

  private async checkImportPaths(): Promise<void> {
    console.log(' Checking import paths...');

    const apiFiles = await glob('app/api/**/*.ts');
    const componentFiles = await glob('app/**/*.tsx');
    const libFiles = await glob('app/lib/**/*.ts');
    const allFiles = [...apiFiles, ...componentFiles, ...libFiles].filter(
      (file) =>
        !file.includes('.next/') && !file.includes('node_modules/') && !file.includes('dist/'),
    );

    for (const file of allFiles) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for old import patterns
        if (line.includes("from '@/lib/db'") && !line.includes('await import')) {
          this.errors.push(`${file}:${i + 1} - Direct import of @/lib/db (use dynamic import)`);
        }

        if (line.includes("from '@/app/lib/prisma'") && !line.includes('await import')) {
          this.errors.push(
            `${file}:${i + 1} - Direct import of @/app/lib/prisma (use dynamic import)`,
          );
        }

        if (line.includes("from '@/app/lib/authz'") && !line.includes('await import')) {
          this.errors.push(
            `${file}:${i + 1} - Direct import of @/app/lib/authz (use dynamic import)`,
          );
        }

        if (line.includes("from '@/app/lib/logger'") && !line.includes('await import')) {
          this.errors.push(
            `${file}:${i + 1} - Direct import of @/app/lib/logger (use dynamic import)`,
          );
        }

        // Check for process.env usage (only in source files, not compiled files)
        // Allow NEXT_PUBLIC_ variables in client components
        if (
          line.includes('process.env') &&
          !line.includes('process.env.NEXT_PUBLIC_') &&
          !file.includes('env.mjs') &&
          !file.includes('env.ts') &&
          !file.includes('next.config') &&
          !file.includes('.next/') &&
          !file.includes('node_modules/') &&
          !file.includes('dist/') &&
          !file.includes('scripts/') &&
          !file.includes('lib/performance/') &&
          !file.includes('lib/feature-flags/')
        ) {
          this.errors.push(`${file}:${i + 1} - Direct process.env usage (use env from env.mjs)`);
        }
      }
    }

    if (this.errors.length === 0) {
      console.log('   Import paths OK');
    }
  }

  private async checkMissingComponents(): Promise<void> {
    console.log(' Checking for missing components...');

    const componentFiles = await glob('app/**/*.tsx');
    const missingComponents = new Set<string>();

    for (const file of componentFiles) {
      const content = readFileSync(file, 'utf-8');
      const importMatches = content.matchAll(/import.*from\s+['"]([^'"]+)['"]/g);

      for (const match of importMatches) {
        const importPath = match[1];
        if (importPath.startsWith('@/components/')) {
          const componentPath = importPath.replace('@/components/', 'components/');
          if (!existsSync(componentPath + '.tsx') && !existsSync(componentPath + '.ts')) {
            missingComponents.add(importPath);
          }
        }
      }
    }

    if (missingComponents.size > 0) {
      this.errors.push(`Missing components: ${Array.from(missingComponents).join(', ')}`);
    } else {
      console.log('   All components exist');
    }
  }

  private async checkTypeConsistency(): Promise<void> {
    console.log(' Checking type consistency...');

    // Check for common type mismatches
    const apiFiles = await glob('app/api/**/*.ts');

    for (const file of apiFiles) {
      const content = readFileSync(file, 'utf-8');

      // Check for CouponMeta type issues
      if (content.includes('CouponMeta') && content.includes('id:')) {
        this.warnings.push(`${file} - CouponMeta type doesn't have 'id' field`);
      }

      // Check for Prisma field mismatches
      if (content.includes('row.value') && !content.includes('row.valueCents')) {
        this.warnings.push(`${file} - Using 'row.value' instead of 'row.valueCents'`);
      }
    }

    console.log('   Type consistency check complete');
  }

  private async checkEnvironmentVariables(): Promise<void> {
    console.log(' Checking environment variables...');

    if (!existsSync('.env')) {
      this.warnings.push('No .env file found');
    }

    if (!existsSync('env.mjs')) {
      this.errors.push('env.mjs file missing');
    }

    console.log('   Environment check complete');
  }
}

// Run validation
async function main() {
  const validator = new PreBuildValidator();
  const result = await validator.validate();

  if (!result.success) {
    process.exit(1);
  }
}

main().catch(console.error);
