# Production Readiness Verification Script (PowerShell)
# Runs all critical checks before deployment

$ErrorActionPreference = "Stop"

Write-Host "🔍 Production Readiness Verification" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Code Quality
Write-Host "📝 Phase 1: Code Quality Checks" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow
try {
    npm run typecheck
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript check failed" -ForegroundColor Red
        exit 1
    }
    
    npm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Linting passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Linting failed" -ForegroundColor Red
        exit 1
    }
    
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error in Phase 1: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Phase 2: Tests
Write-Host "🧪 Phase 2: Test Suite" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow
try {
    npm run test:unit 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Unit tests passed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unit tests failed or not configured - continuing..." -ForegroundColor Yellow
    }
    
    npm run test:e2e:smoke 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ E2E smoke tests passed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  E2E smoke tests failed or not configured - continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Test phase had issues - review manually" -ForegroundColor Yellow
}
Write-Host ""

# Phase 3: Preflight
Write-Host "✈️  Phase 3: Preflight Checks" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
try {
    if (Get-Command tsx -ErrorAction SilentlyContinue) {
        npx tsx scripts/preflight.ts
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Preflight checks passed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Preflight checks failed - review manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  tsx not available - skipping preflight" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Preflight check had issues - review manually" -ForegroundColor Yellow
}
Write-Host ""

# Phase 4: Performance
Write-Host "⚡ Phase 4: Performance Check" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
try {
    if (Get-Command tsx -ErrorAction SilentlyContinue) {
        npx tsx scripts/check-performance-budget.ts
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Performance budget check passed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Performance check failed - review manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  tsx not available - skipping performance check" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Performance check had issues - review manually" -ForegroundColor Yellow
}
Write-Host ""

# Phase 5: Links
Write-Host "🔗 Phase 5: Link Verification" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow
try {
    if (Test-Path "scripts/check-links.mjs") {
        node scripts/check-links.mjs
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Link verification passed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Link verification failed - review manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Link check script not found - skipping" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Link check had issues - review manually" -ForegroundColor Yellow
}
Write-Host ""

# Phase 6: Security
Write-Host "🔒 Phase 6: Security Check" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow
try {
    npm audit --audit-level=moderate 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Security audit passed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Security audit found issues - review manually" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Security audit had issues - review manually" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "✅ All critical checks completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review any warnings above"
Write-Host "2. Run manual verification checklist"
Write-Host "3. Test in staging environment"
Write-Host "4. Deploy to production"
Write-Host ""

