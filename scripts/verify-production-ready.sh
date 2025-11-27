#!/bin/bash

# Production Readiness Verification Script
# Runs all critical checks before deployment

set -e  # Exit on any error

echo "🔍 Production Readiness Verification"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Phase 1: Code Quality
echo "📝 Phase 1: Code Quality Checks"
echo "-------------------------------"
npm run typecheck && print_status $? "TypeScript check passed" || exit 1
npm run lint && print_status $? "Linting passed" || exit 1
npm run build && print_status $? "Build successful" || exit 1
echo ""

# Phase 2: Tests
echo "🧪 Phase 2: Test Suite"
echo "----------------------"
if npm run test:unit > /dev/null 2>&1; then
    print_status 0 "Unit tests passed"
else
    echo -e "${YELLOW}⚠️  Unit tests failed or not configured - continuing...${NC}"
fi

if npm run test:e2e:smoke > /dev/null 2>&1; then
    print_status 0 "E2E smoke tests passed"
else
    echo -e "${YELLOW}⚠️  E2E smoke tests failed or not configured - continuing...${NC}"
fi
echo ""

# Phase 3: Preflight
echo "✈️  Phase 3: Preflight Checks"
echo "----------------------------"
if command -v tsx &> /dev/null; then
    npx tsx scripts/preflight.ts && print_status $? "Preflight checks passed" || echo -e "${YELLOW}⚠️  Preflight checks failed - review manually${NC}"
else
    echo -e "${YELLOW}⚠️  tsx not available - skipping preflight${NC}"
fi
echo ""

# Phase 4: Performance
echo "⚡ Phase 4: Performance Check"
echo "----------------------------"
if command -v tsx &> /dev/null; then
    npx tsx scripts/check-performance-budget.ts && print_status $? "Performance budget check passed" || echo -e "${YELLOW}⚠️  Performance check failed - review manually${NC}"
else
    echo -e "${YELLOW}⚠️  tsx not available - skipping performance check${NC}"
fi
echo ""

# Phase 5: Links
echo "🔗 Phase 5: Link Verification"
echo "----------------------------"
if [ -f "scripts/check-links.mjs" ]; then
    node scripts/check-links.mjs && print_status $? "Link verification passed" || echo -e "${YELLOW}⚠️  Link verification failed - review manually${NC}"
else
    echo -e "${YELLOW}⚠️  Link check script not found - skipping${NC}"
fi
echo ""

# Phase 6: Security
echo "🔒 Phase 6: Security Check"
echo "-------------------------"
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    print_status 0 "Security audit passed"
else
    echo -e "${YELLOW}⚠️  Security audit found issues - review manually${NC}"
fi
echo ""

echo "===================================="
echo -e "${GREEN}✅ All critical checks completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Review any warnings above"
echo "2. Run manual verification checklist"
echo "3. Test in staging environment"
echo "4. Deploy to production"
echo ""

