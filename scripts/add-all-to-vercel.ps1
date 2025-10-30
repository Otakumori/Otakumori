#!/usr/bin/env pwsh
# Add ALL missing critical environment variables to Vercel

$ErrorActionPreference = 'Continue'

Write-Host "`n🚀 Adding ALL Missing Variables to Vercel`n" -ForegroundColor Cyan

# Read all variables from .env.local into hashtable
$envVars = @{}
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        if ($value -and -not $envVars.ContainsKey($name)) {
            $envVars[$name] = $value
        }
    }
}

# Critical variables to add (in order of importance)
$criticalVars = @(
    # Printify (BUSINESS CRITICAL)
    'PRINTIFY_API_KEY',
    'PRINTIFY_SHOP_ID',
    'PRINTIFY_WEBHOOK_SECRET',
    'PRINTIFY_API_URL',
    
    # Backend services
    'API_KEY',
    'BLOB_READ_WRITE_TOKEN',
    'BLOB_READ_WRITE_URL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'INNGEST_EVENT_KEY',
    'INNGEST_SIGNING_KEY',
    'INNGEST_SERVE_URL',
    'INNGEST_PROBE',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'CRON_SECRET',
    'PETAL_SALT',
    'AUTH_SECRET',
    'CLERK_WEBHOOK_SECRET',
    'STRIPE_WEBHOOK_SECRET',
    'DIRECT_URL',
    
    # New services
    'ALGOLIA_ADMIN_API_KEY',
    'NEXT_PUBLIC_ALGOLIA_APP_ID',
    'NEXT_PUBLIC_ALGOLIA_SEARCH_KEY',
    'ALGOLIA_INDEX_BLOG',
    'ALGOLIA_INDEX_GAMES',
    'ALGOLIA_INDEX_PAGES',
    'EASYPOST_API_KEY',
    'EASYPOST_WEBHOOK_SECRET',
    'DEFAULT_SHIP_FROM_NAME',
    'DEFAULT_SHIP_FROM_STREET',
    'DEFAULT_SHIP_FROM_CITY',
    'DEFAULT_SHIP_FROM_STATE',
    'DEFAULT_SHIP_FROM_ZIP',
    'DEFAULT_SHIP_FROM_COUNTRY',
    'SANITY_WEBHOOK_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    
    # Admin & App
    'NEXT_PUBLIC_ADMIN_API_KEY',
    'NEXT_PUBLIC_APP_VERSION',
    'NEXT_PUBLIC_APP_ENV',
    'NEXT_PUBLIC_CANONICAL_ORIGIN',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_PROXY_URL',
    'NEXT_PUBLIC_DAILY_PETAL_LIMIT',
    'NEXT_PUBLIC_VERCEL_ENVIRONMENT',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'NEXT_PUBLIC_POSTHOG_KEY',
    'NEXT_PUBLIC_POSTHOG_HOST',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_COMMUNITY_WS_URL',
    'NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS',
    
    # Feature flags
    'NEXT_PUBLIC_FEATURE_STARFIELD',
    'NEXT_PUBLIC_FEATURE_RUNE',
    'NEXT_PUBLIC_FEATURE_PETALS',
    'NEXT_PUBLIC_FEATURE_CUBE_HUB',
    'NEXT_PUBLIC_FEATURE_PETALS_ABOUT',
    'NEXT_PUBLIC_FEATURE_HERO',
    'NEXT_PUBLIC_FEATURE_SHOP',
    'NEXT_PUBLIC_FEATURE_BLOG',
    'NEXT_PUBLIC_FEATURE_MINIGAMES',
    'NEXT_PUBLIC_FEATURE_SOAPSTONES',
    'NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE',
    'NEXT_PUBLIC_FEATURE_GA_ENABLED',
    'NEXT_PUBLIC_FEATURE_COMMUNITY_FACE2',
    'NEXT_PUBLIC_FEATURE_TRADE_PROPOSE',
    'NEXT_PUBLIC_FEATURE_JIGGLE',
    'NEXT_PUBLIC_FEATURE_DIRTY_EMOTES',
    'NEXT_PUBLIC_FEATURE_EVENTS',
    'NEXT_PUBLIC_LIVE_DATA',
    'NEXT_PUBLIC_PROBE_MODE',
    'NEXT_PUBLIC_EVENT_CODE',
    
    # Server feature flags
    'FEATURE_ADULT_ZONE',
    'FEATURE_GATED_COSMETICS',
    'FEATURE_AVATARS',
    'FEATURE_AVATAR_STYLIZED_SHADERS'
)

$added = 0
$skipped = 0
$failed = 0

foreach ($varName in $criticalVars) {
    if (-not $envVars.ContainsKey($varName)) {
        Write-Host "  ⏭️  $varName (not in .env.local)" -ForegroundColor DarkGray
        $skipped++
        continue
    }
    
    $value = $envVars[$varName]
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "  ⏭️  $varName (empty)" -ForegroundColor DarkGray
        $skipped++
        continue
    }
    
    Write-Host "  ➕ $varName..." -NoNewline -ForegroundColor Cyan
    
    try {
        # Add to each environment
        foreach ($env in @('production', 'preview', 'development')) {
            $tempFile = [System.IO.Path]::GetTempFileName()
            Set-Content -Path $tempFile -Value $value -NoNewline
            Get-Content $tempFile | vercel env add $varName $env 2>&1 | Out-Null
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
        
        Write-Host " ✅" -ForegroundColor Green
        $added++
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ Added: $added" -ForegroundColor Green
Write-Host "⏭️  Skipped: $skipped" -ForegroundColor Yellow
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host ("=" * 60) + "`n" -ForegroundColor Cyan

if ($added -gt 0) {
    Write-Host "🎉 SUCCESS! Variables synced to Vercel!" -ForegroundColor Green
    Write-Host "`n💡 Next: Redeploy your site for changes to take effect`n" -ForegroundColor Cyan
}

