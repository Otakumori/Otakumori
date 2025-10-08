#!/usr/bin/env node

/**
 * Safe Batch Warning Fixer for Otakumori
 *
 * This script systematically fixes ESLint warnings without breaking functionality.
 * It includes safety checks, backups, and rollback capabilities.
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

// Configuration
const BACKUP_DIR = './backups/warning-fixes';
const LOG_FILE = './warning-fix-log.txt';

// Safety thresholds
const MAX_FILES_PER_BATCH = 20;
const MAX_WARNINGS_PER_FILE = 50;

class SafeWarningFixer {
  constructor() {
    this.log = [];
    this.backups = new Map();
    this.stats = {
      filesProcessed: 0,
      warningsFixed: 0,
      errorsEncountered: 0,
    };
  }

  async logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.log.push(logEntry);
    console.log(logEntry);

    // Append to log file
    await fs.appendFile(LOG_FILE, logEntry + '\n');
  }

  async createBackup(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const backupPath = path.join(BACKUP_DIR, filePath.replace(/[\\\/]/g, '_'));
      await fs.mkdir(path.dirname(backupPath), { recursive: true });
      await fs.writeFile(backupPath, content);
      this.backups.set(filePath, backupPath);
      return true;
    } catch (error) {
      await this.logMessage(`❌ Failed to backup ${filePath}: ${error.message}`);
      return false;
    }
  }

  async getCurrentWarningCount() {
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

  async getFilesWithWarnings() {
    try {
      const result = execSync('npm run lint', { encoding: 'utf8' });
      const lines = result.split('\n');
      const files = new Set();

      for (const line of lines) {
        const match = line.match(/^\.\/([^\s]+)/);
        if (match) {
          files.add(match[1]);
        }
      }

      return Array.from(files);
    } catch (error) {
      // npm run lint exits with code 1 when there are warnings, which is expected
      const result = error.stdout || error.message;
      const lines = result.split('\n');
      const files = new Set();

      for (const line of lines) {
        const match = line.match(/^\.\/([^\s]+)/);
        if (match) {
          files.add(match[1]);
        }
      }

      return Array.from(files);
    }
  }

  async fixUnusedCatchBlocks(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;

      // Pattern 1: } catch (error) { -> } catch {
      const pattern1 = /} catch \(error\) \{/g;
      const matches1 = content.match(pattern1);
      if (matches1) {
        content = content.replace(pattern1, '} catch {');
        modified = true;
        await this.logMessage(`  ✅ Fixed ${matches1.length} unused 'error' in catch blocks`);
      }

      // Pattern 2: } catch (e) { -> } catch {
      const pattern2 = /} catch \(e\) \{/g;
      const matches2 = content.match(pattern2);
      if (matches2) {
        content = content.replace(pattern2, '} catch {');
        modified = true;
        await this.logMessage(`  ✅ Fixed ${matches2.length} unused 'e' in catch blocks`);
      }

      // Pattern 3: } catch (err) { -> } catch {
      const pattern3 = /} catch \(err\) \{/g;
      const matches3 = content.match(pattern3);
      if (matches3) {
        content = content.replace(pattern3, '} catch {');
        modified = true;
        await this.logMessage(`  ✅ Fixed ${matches3.length} unused 'err' in catch blocks`);
      }

      if (modified) {
        await fs.writeFile(filePath, content);
        return true;
      }

      return false;
    } catch (error) {
      await this.logMessage(`  ❌ Failed to fix catch blocks in ${filePath}: ${error.message}`);
      return false;
    }
  }

  async fixUnusedParameters(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;

      // Pattern: function(param) -> function(_param)
      // Only for obvious unused parameters in function signatures
      const unusedParamPattern = /function\s+(\w+)\s*\(\s*(\w+)\s*\)\s*\{/g;
      const matches = Array.from(content.matchAll(unusedParamPattern));

      for (const match of matches) {
        const [fullMatch, funcName, paramName] = match;
        // Check if parameter is used in function body
        const funcBody = this.extractFunctionBody(content, match.index);
        if (funcBody && !funcBody.includes(paramName)) {
          const replacement = fullMatch.replace(paramName, `_${paramName}`);
          content = content.replace(fullMatch, replacement);
          modified = true;
          await this.logMessage(
            `  ✅ Fixed unused parameter '${paramName}' in function '${funcName}'`,
          );
        }
      }

      if (modified) {
        await fs.writeFile(filePath, content);
        return true;
      }

      return false;
    } catch (error) {
      await this.logMessage(`  ❌ Failed to fix parameters in ${filePath}: ${error.message}`);
      return false;
    }
  }

  extractFunctionBody(content, startIndex) {
    // Simple function body extraction - looks for opening brace and finds matching closing brace
    const openIndex = content.indexOf('{', startIndex);
    if (openIndex === -1) return null;

    let braceCount = 1;
    let currentIndex = openIndex + 1;

    while (currentIndex < content.length && braceCount > 0) {
      if (content[currentIndex] === '{') braceCount++;
      else if (content[currentIndex] === '}') braceCount--;
      currentIndex++;
    }

    return content.substring(openIndex + 1, currentIndex - 1);
  }

  async validateFile(filePath) {
    try {
      // Run TypeScript check on the file
      execSync(`npx tsc --noEmit --skipLibCheck ${filePath}`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return true;
    } catch (error) {
      await this.logMessage(`  ❌ TypeScript validation failed for ${filePath}`);
      return false;
    }
  }

  async rollbackFile(filePath) {
    const backupPath = this.backups.get(filePath);
    if (backupPath) {
      try {
        const backupContent = await fs.readFile(backupPath, 'utf8');
        await fs.writeFile(filePath, backupContent);
        await this.logMessage(`  🔄 Rolled back ${filePath} from backup`);
        return true;
      } catch (error) {
        await this.logMessage(`  ❌ Failed to rollback ${filePath}: ${error.message}`);
        return false;
      }
    }
    return false;
  }

  async processFile(filePath) {
    await this.logMessage(`📁 Processing ${filePath}`);

    // Create backup
    const backupSuccess = await this.createBackup(filePath);
    if (!backupSuccess) {
      this.stats.errorsEncountered++;
      return false;
    }

    let fileModified = false;

    // Fix unused catch blocks
    const catchFixed = await this.fixUnusedCatchBlocks(filePath);
    if (catchFixed) fileModified = true;

    // Fix unused parameters (more conservative)
    const paramsFixed = await this.fixUnusedParameters(filePath);
    if (paramsFixed) fileModified = true;

    if (fileModified) {
      // Validate the file
      const isValid = await this.validateFile(filePath);
      if (!isValid) {
        await this.logMessage(`  ❌ Validation failed, rolling back ${filePath}`);
        await this.rollbackFile(filePath);
        this.stats.errorsEncountered++;
        return false;
      }

      this.stats.filesProcessed++;
      await this.logMessage(`  ✅ Successfully processed ${filePath}`);
    } else {
      await this.logMessage(`  ⏭️  No changes needed for ${filePath}`);
    }

    return true;
  }

  async runBatch(batchNumber = 1) {
    await this.logMessage(`🚀 Starting Batch ${batchNumber}`);

    // Get initial warning count
    const initialWarnings = await this.getCurrentWarningCount();
    if (initialWarnings === -1) {
      await this.logMessage(`❌ Cannot proceed - unable to get warning count`);
      return false;
    }

    await this.logMessage(`📊 Initial warnings: ${initialWarnings}`);

    // Get files with warnings
    const files = await this.getFilesWithWarnings();
    if (files.length === 0) {
      await this.logMessage(`🎉 No files with warnings found!`);
      return true;
    }

    await this.logMessage(`📁 Found ${files.length} files with warnings`);

    // Process files in batches
    const batchSize = Math.min(MAX_FILES_PER_BATCH, files.length);
    const batchFiles = files.slice(0, batchSize);

    for (const file of batchFiles) {
      await this.processFile(file);

      // Check warning count after each file
      const currentWarnings = await this.getCurrentWarningCount();
      this.stats.warningsFixed = initialWarnings - currentWarnings;

      await this.logMessage(`📊 Warnings fixed so far: ${this.stats.warningsFixed}`);
    }

    // Final validation
    const finalWarnings = await this.getCurrentWarningCount();
    await this.logMessage(`📊 Final warnings: ${finalWarnings}`);
    await this.logMessage(
      `✅ Batch ${batchNumber} complete: ${this.stats.filesProcessed} files processed, ${this.stats.warningsFixed} warnings fixed`,
    );

    return true;
  }

  async cleanup() {
    await this.logMessage(`🧹 Cleaning up temporary files`);
    // Keep backups for now - they can be manually cleaned later
  }
}

// Main execution
async function main() {
  const fixer = new SafeWarningFixer();

  try {
    await fixer.logMessage(`🔧 Safe Warning Fixer Starting`);

    // Create backup directory
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Run first batch
    const success = await fixer.runBatch(1);

    if (success) {
      await fixer.logMessage(`🎉 Batch processing completed successfully!`);
      await fixer.logMessage(`📊 Final Stats:`);
      await fixer.logMessage(`  - Files processed: ${fixer.stats.filesProcessed}`);
      await fixer.logMessage(`  - Warnings fixed: ${fixer.stats.warningsFixed}`);
      await fixer.logMessage(`  - Errors encountered: ${fixer.stats.errorsEncountered}`);
    } else {
      await fixer.logMessage(`❌ Batch processing failed`);
      process.exit(1);
    }
  } catch (error) {
    await fixer.logMessage(`💥 Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Export for testing
export { SafeWarningFixer };

// Run if called directly
if (
  import.meta.url.endsWith(process.argv[1]) ||
  import.meta.url.includes('batch-fix-warnings.mjs')
) {
  main().catch(console.error);
}
