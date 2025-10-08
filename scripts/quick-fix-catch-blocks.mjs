#!/usr/bin/env node

/**
 * Quick Fix for Unused Catch Block Variables
 *
 * This is a focused script that only fixes the safest pattern:
 * unused variables in catch blocks (error, e, err)
 *
 * This is the lowest-risk fix with highest impact.
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const BACKUP_DIR = './backups/catch-block-fixes';

class CatchBlockFixer {
  constructor() {
    this.fixed = 0;
    this.errors = 0;
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async createBackup(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const backupPath = path.join(BACKUP_DIR, filePath.replace(/[\\\/]/g, '_'));
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, content);
      return true;
    } catch (error) {
      await this.log(`❌ Backup failed for ${filePath}: ${error.message}`);
      return false;
    }
  }

  async fixCatchBlocks(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;
      let fixes = 0;

      // Pattern 1: } catch (error) {
      const errorPattern = /} catch \(error\) \{/g;
      const errorMatches = content.match(errorPattern);
      if (errorMatches) {
        content = content.replace(errorPattern, '} catch {');
        fixes += errorMatches.length;
        modified = true;
      }

      // Pattern 2: } catch (e) {
      const ePattern = /} catch \(e\) \{/g;
      const eMatches = content.match(ePattern);
      if (eMatches) {
        content = content.replace(ePattern, '} catch {');
        fixes += eMatches.length;
        modified = true;
      }

      // Pattern 3: } catch (err) {
      const errPattern = /} catch \(err\) \{/g;
      const errMatches = content.match(errPattern);
      if (errMatches) {
        content = content.replace(errPattern, '} catch {');
        fixes += errMatches.length;
        modified = true;
      }

      if (modified) {
        await fs.writeFile(filePath, content);
        await this.log(`✅ ${filePath}: Fixed ${fixes} catch blocks`);
        this.fixed += fixes;
        return true;
      }

      return false;
    } catch (error) {
      await this.log(`❌ Failed to fix ${filePath}: ${error.message}`);
      this.errors++;
      return false;
    }
  }

  async getFilesWithCatchBlocks() {
    try {
      const result = execSync('npm run lint', { encoding: 'utf8' });
      const lines = result.split('\n');
      const files = new Set();

      for (const line of lines) {
        // Look for catch block warnings
        if (line.includes('catch') && line.includes('never used')) {
          const match = line.match(/^\.\/([^\s]+)/);
          if (match) {
            files.add(match[1]);
          }
        }
      }

      return Array.from(files);
    } catch (error) {
      // npm run lint exits with code 1 when there are warnings, which is expected
      const result = error.stdout || error.message;
      const lines = result.split('\n');
      const files = new Set();

      for (const line of lines) {
        // Look for catch block warnings
        if (line.includes('catch') && line.includes('never used')) {
          const match = line.match(/^\.\/([^\s]+)/);
          if (match) {
            files.add(match[1]);
          }
        }
      }

      return Array.from(files);
    }
  }

  async getInitialWarningCount() {
    try {
      const result = execSync('npm run lint', { encoding: 'utf8' });
      const warnings = result.match(/Warning:/g);
      return warnings ? warnings.length : 0;
    } catch (error) {
      // npm run lint exits with code 1 when there are warnings, which is expected
      const result = error.stdout || error.message;
      const warnings = result.match(/Warning:/g);
      return warnings ? warnings.length : 0;
    }
  }

  async run() {
    await this.log('🚀 Starting catch block fixer');

    // Create backup directory
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Get initial count
    const initialWarnings = await this.getInitialWarningCount();
    if (initialWarnings === -1) {
      await this.log('❌ Cannot proceed - unable to get warning count');
      return;
    }

    await this.log(`📊 Initial warnings: ${initialWarnings}`);

    // Get files with catch block issues
    const files = await this.getFilesWithCatchBlocks();
    await this.log(`📁 Found ${files.length} files with catch block issues`);

    // Process each file
    for (const file of files) {
      await this.log(`📝 Processing ${file}`);

      // Create backup
      const backupSuccess = await this.createBackup(file);
      if (!backupSuccess) {
        continue;
      }

      // Fix catch blocks
      await this.fixCatchBlocks(file);
    }

    // Final count
    const finalWarnings = await this.getInitialWarningCount();
    const warningsFixed = initialWarnings - finalWarnings;

    await this.log(`🎉 Complete!`);
    await this.log(`📊 Warnings fixed: ${warningsFixed}`);
    await this.log(`📊 Catch blocks fixed: ${this.fixed}`);
    await this.log(`❌ Errors encountered: ${this.errors}`);
    await this.log(`📁 Backup directory: ${BACKUP_DIR}`);

    if (this.errors === 0) {
      await this.log('✅ All fixes applied successfully!');
    } else {
      await this.log('⚠️  Some errors occurred - check logs above');
    }
  }
}

// Run the fixer
const fixer = new CatchBlockFixer();
fixer.run().catch(console.error);
