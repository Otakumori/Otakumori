#!/usr/bin/env node
/**
 * Script to help identify and replace console.log/error/warn with logger
 * Run: node scripts/replace-console-logs.mjs
 * 
 * This script:
 * 1. Scans app/api/**/*.ts files
 * 2. Identifies console statements
 * 3. Suggests logger replacements
 * 4. Creates a report
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const API_DIR = './app/api';
const REPORT_FILE = './console-log-cleanup-report.md';

function findTsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (extname(file) === '.ts' || extname(file) === '.tsx') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Match console.log, console.error, console.warn
    const consoleMatch = line.match(/console\.(log|error|warn|info|debug)\s*\(/);
    if (consoleMatch) {
      const method = consoleMatch[1];
      issues.push({
        line: lineNum,
        method,
        content: line.trim(),
        file: filePath,
      });
    }
  });
  
  return issues;
}

function generateReplacement(issue) {
  const { method, content } = issue;
  
  // Extract the message and potential data
  const match = content.match(/console\.\w+\s*\(['"`]([^'"`]+)['"`]\s*,?\s*(.*)\)/);
  
  if (!match) {
    return {
      original: content,
      replacement: `// TODO: Replace with logger.${method}()`,
      needsManualReview: true,
    };
  }
  
  const message = match[1];
  const data = match[2]?.trim() || '';
  
  // Determine logger method
  let loggerMethod = method;
  if (method === 'log') loggerMethod = 'info';
  if (method === 'debug') loggerMethod = 'debug';
  
  // Build replacement
  let replacement = `logger.${loggerMethod}('${message}'`;
  
  if (data) {
    replacement += `, { requestId }, ${data}`;
  } else {
    replacement += `, { requestId }`;
  }
  
  replacement += ');';
  
  return {
    original: content,
    replacement,
    needsManualReview: false,
  };
}

// Main execution
const files = findTsFiles(API_DIR);
const allIssues = [];

files.forEach(file => {
  const issues = analyzeFile(file);
  if (issues.length > 0) {
    allIssues.push({ file, issues });
  }
});

// Generate report
let report = '# Console Log Cleanup Report\n\n';
report += `Found ${allIssues.reduce((sum, f) => sum + f.issues.length, 0)} console statements across ${allIssues.length} files.\n\n`;

allIssues.forEach(({ file, issues }) => {
  report += `## ${file}\n\n`;
  report += `Found ${issues.length} console statement(s):\n\n`;
  
  issues.forEach(issue => {
    const replacement = generateReplacement(issue);
    report += `### Line ${issue.line}: ${issue.method}\n\n`;
    report += `**Original:**\n\`\`\`typescript\n${issue.content}\n\`\`\`\n\n`;
    report += `**Replacement:**\n\`\`\`typescript\n${replacement.replacement}\n\`\`\`\n\n`;
    
    if (replacement.needsManualReview) {
      report += `⚠️ **Needs manual review**\n\n`;
    }
    
    report += `---\n\n`;
  });
});

writeFileSync(REPORT_FILE, report);
console.log(`✅ Report generated: ${REPORT_FILE}`);
console.log(`📊 Total issues: ${allIssues.reduce((sum, f) => sum + f.issues.length, 0)}`);

