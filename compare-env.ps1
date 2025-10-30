$ErrorActionPreference = 'Stop'

Write-Host "
ðŸ” COMPARING LOCAL vs VERCEL ENVIRONMENT
" -ForegroundColor Cyan

# Read both files
$local = Get-Content .env.local | Where-Object { $_ -match '^[A-Z_][A-Z0-9_]*=' }
$vercel = Get-Content .env.vercel -ErrorAction SilentlyContinue | Where-Object { $_ -match '^[A-Z_][A-Z0-9_]*=' }

# Extract variable names
$localVars = $local | ForEach-Object { ($_ -split '=')[0] } | Sort-Object -Unique
$vercelVars = $vercel | ForEach-Object { ($_ -split '=')[0] } | Sort-Object -Unique

# Find missing from Vercel
$missing = $localVars | Where-Object { $vercelVars -notcontains $_ }

# Categorize
$critical = @(
    'API_KEY', 'CLERK_SECRET_KEY', 'CLERK_WEBHOOK_SECRET', 'CLERK_ENCRYPTION_KEY',
    'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'DATABASE_URL', 'DIRECT_URL',
    'PRINTIFY_API_KEY', 'PRINTIFY_SHOP_ID', 'PRINTIFY_WEBHOOK_SECRET',
    'BLOB_READ_WRITE_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
    'INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY', 'RESEND_API_KEY', 'EMAIL_FROM'
)

$new = @(
    'ALGOLIA_ADMIN_API_KEY', 'EASYPOST_API_KEY', 'EASYPOST_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY', 'SANITY_WEBHOOK_SECRET',
    'NEXT_PUBLIC_ALGOLIA_APP_ID', 'NEXT_PUBLIC_ALGOLIA_SEARCH_KEY',
    'NEXT_PUBLIC_ADMIN_API_KEY', 'DEFAULT_SHIP_FROM_NAME', 'DEFAULT_SHIP_FROM_STREET',
    'DEFAULT_SHIP_FROM_CITY', 'DEFAULT_SHIP_FROM_STATE', 'DEFAULT_SHIP_FROM_ZIP',
    'DEFAULT_SHIP_FROM_COUNTRY', 'ALGOLIA_INDEX_BLOG', 'ALGOLIA_INDEX_GAMES',
    'ALGOLIA_INDEX_PAGES'
)

Write-Host "ðŸ”´ CRITICAL MISSING FROM VERCEL:
" -ForegroundColor Red
$criticalMissing = $missing | Where-Object { $critical -contains $_ }
if ($criticalMissing) {
    $criticalMissing | ForEach-Object { Write-Host "   âŒ $_" -ForegroundColor Red }
} else {
    Write-Host "   âœ… All critical keys present!" -ForegroundColor Green
}

Write-Host "
ðŸ†• NEW KEYS MISSING FROM VERCEL:
" -ForegroundColor Yellow
$newMissing = $missing | Where-Object { $new -contains $_ }
if ($newMissing) {
    $newMissing | ForEach-Object { Write-Host "   âš ï¸  $_" -ForegroundColor Yellow }
    Write-Host "
   Total new keys to add: $($newMissing.Count)" -ForegroundColor Yellow
} else {
    Write-Host "   âœ… All new keys present!" -ForegroundColor Green
}

Write-Host "
ðŸ”µ OTHER MISSING:
" -ForegroundColor Blue
$otherMissing = $missing | Where-Object { ($critical + $new) -notcontains $_ }
if ($otherMissing) {
    $otherMissing | ForEach-Object { Write-Host "   â„¹ï¸  $_" -ForegroundColor Cyan }
}

Write-Host "
" + ("=" * 70) -ForegroundColor Cyan
Write-Host "ðŸ“Š SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "Total in .env.local: $($localVars.Count)" -ForegroundColor White
Write-Host "Total in Vercel: $($vercelVars.Count)" -ForegroundColor White
Write-Host "Missing from Vercel: $($missing.Count)" -ForegroundColor Yellow
Write-Host ("=" * 70) + "
" -ForegroundColor Cyan

if ($missing.Count -gt 0) {
    Write-Host "ðŸŽ¯ NEXT STEP: Add missing variables to Vercel
" -ForegroundColor Yellow
    Write-Host "Run: .\scripts\add-missing-to-vercel.ps1
" -ForegroundColor Cyan
}
