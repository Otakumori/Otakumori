#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const API_DIR = './app/api';

function findRouteFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function analyzeFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Check for createApiSuccess usage
  const hasCreateApiSuccess = content.includes('createApiSuccess');
  const hasCreateApiError = content.includes('createApiError');
  const hasGenerateRequestId = content.includes('generateRequestId');
  
  // Check for manual error responses
  const manualErrorResponses = content.match(/NextResponse\.json\(\s*\{[^}]*ok:\s*false/gs);
  const manualSuccessResponses = content.match(/NextResponse\.json\(\s*\{[^}]*ok:\s*true/gs);
  
  // Check for console.error (should use logger)
  const hasConsoleError = /console\.(error|log|warn)/.test(content);
  
  if (!hasCreateApiSuccess && manualSuccessResponses) {
    issues.push('Uses manual success response instead of createApiSuccess');
  }
  
  if (!hasCreateApiError && manualErrorResponses) {
    issues.push('Uses manual error response instead of createApiError');
  }
  
  if (!hasGenerateRequestId) {
    issues.push('Missing generateRequestId - no requestId in responses');
  }
  
  if (hasConsoleError) {
    issues.push('Uses console.error/log instead of logger');
  }
  
  return {
    file: filePath,
    issues,
    hasCreateApiSuccess,
    hasCreateApiError,
    hasGenerateRequestId,
  };
}

const files = findRouteFiles(API_DIR);
const results = files.map(analyzeFile).filter(r => r.issues.length > 0);

console.log(`\n📊 API Response Standardization Audit\n`);
console.log(`Total route files: ${files.length}`);
console.log(`Files with issues: ${results.length}\n`);

results.forEach(result => {
  console.log(`\n${result.file}`);
  result.issues.forEach(issue => {
    console.log(`  ⚠️  ${issue}`);
  });
});

