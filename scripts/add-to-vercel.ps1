#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automatically add all environment variables to Vercel
.DESCRIPTION
    Reads .env.local and adds all variables to Vercel for Production, Preview, and Development
#>

Write-Host "`n🚀 Vercel Environment Variables Setup`n" -ForegroundColor Cyan

# Check if Vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm i -g vercel
}

# Check if logged in
Write-Host "🔐 Checking Vercel login status..." -ForegroundColor Cyan
vercel whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in. Please login to Vercel:" -ForegroundColor Yellow
    vercel login
}

# Link project if needed
Write-Host "🔗 Linking to Vercel project..." -ForegroundColor Cyan
vercel link --yes 2>&1 | Out-Null

Write-Host "`n📋 Adding environment variables to Vercel...`n" -ForegroundColor Cyan

# Define ALL critical environment variables that must be in Vercel
$criticalVars = @(
    # Backend secrets
    "API_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_WEBHOOK_SECRET",
    "CLERK_ENCRYPTION_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "DATABASE_URL",
    "DIRECT_URL",
    "PRINTIFY_API_KEY",
    "PRINTIFY_SHOP_ID",
    "PRINTIFY_WEBHOOK_SECRET",
    "BLOB_READ_WRITE_TOKEN",
    "BLOB_READ_WRITE_URL",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "INNGEST_EVENT_KEY",
    "INNGEST_SIGNING_KEY",
    "INNGEST_SERVE_URL",
    "INNGEST_PROBE",
    "RESEND_API_KEY",
    "EMAIL_FROM",
    "CRON_SECRET",
    "PETAL_SALT",
    "AUTH_SECRET",
    
    # New keys
    "ALGOLIA_ADMIN_API_KEY",
    "EASYPOST_API_KEY",
    "EASYPOST_WEBHOOK_SECRET",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SANITY_WEBHOOK_SECRET",
    
    # Public client keys
    "NEXT_PUBLIC_ALGOLIA_APP_ID",
    "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY",
    "NEXT_PUBLIC_ADMIN_API_KEY",
    "NEXT_PUBLIC_POSTHOG_KEY",
    "NEXT_PUBLIC_POSTHOG_HOST"
)

# Read .env.local
$envVars = @{}
Get-Content .env.local -ErrorAction Stop | ForEach-Object {
    if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
        $envVars[$matches[1]] = $matches[2]
    }
}

$added = 0
$skipped = 0
$failed = 0

foreach ($varName in $criticalVars) {
    if (-not $envVars.ContainsKey($varName)) {
        Write-Host "  ⏭️  Skipping $varName (not in .env.local)" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    $value = $envVars[$varName]
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "  ⏭️  Skipping $varName (empty value)" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    Write-Host "  ➕ Adding $varName..." -ForegroundColor Green
    
    # Add to all environments
    $value | vercel env add $varName production --force 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $value | vercel env add $varName preview --force 2>&1 | Out-Null
        $value | vercel env add $varName development --force 2>&1 | Out-Null
        Write-Host "     ✅ Added to Production, Preview, Development" -ForegroundColor Gray
        $added++
    } else {
        Write-Host "     ❌ Failed to add" -ForegroundColor Red
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
    Write-Host "🎉 Success! Environment variables added to Vercel!" -ForegroundColor Green
    Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Redeploy your site (Vercel will use new vars)" -ForegroundColor White
    Write-Host "   2. Test your live site" -ForegroundColor White
    Write-Host "   3. Check deployment logs if issues occur" -ForegroundColor White
} else {
    Write-Host "⚠️  No variables were added. Check your .env.local file." -ForegroundColor Yellow
}

Write-Host "`n📝 Don't forget to add SANITY_WEBHOOK_SECRET to your Sanity webhook config!" -ForegroundColor Yellow
Write-Host "   URL: https://otaku-mori.com/api/webhooks/sanity" -ForegroundColor Gray
Write-Host "   Secret: b73d70a266abafff784805e77bb970151b7190310d96aad3a49b20c3a4540db0`n" -ForegroundColor Gray

