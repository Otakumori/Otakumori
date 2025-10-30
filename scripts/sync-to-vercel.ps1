#!/usr/bin/env pwsh
# Sync all environment variables from .env.local to Vercel

$ErrorActionPreference = 'Stop'

Write-Host "`n🚀 Syncing .env.local → Vercel`n" -ForegroundColor Cyan

# Parse .env.local
$envVars = @{}
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        # Skip empty, comments, duplicates
        if ($value -and -not $envVars.ContainsKey($name)) {
            $envVars[$name] = $value
        }
    }
}

Write-Host "📋 Found $($envVars.Count) variables in .env.local`n" -ForegroundColor Green

# Critical variables that MUST be in Vercel
$mustHave = @(
    'API_KEY', 'CLERK_SECRET_KEY', 'CLERK_WEBHOOK_SECRET', 'CLERK_ENCRYPTION_KEY',
    'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET',
    'DATABASE_URL', 'DIRECT_URL',
    'PRINTIFY_API_KEY', 'PRINTIFY_SHOP_ID', 'PRINTIFY_WEBHOOK_SECRET',
    'BLOB_READ_WRITE_TOKEN', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
    'INNGEST_EVENT_KEY', 'INNGEST_SIGNING_KEY', 'RESEND_API_KEY',
    'ALGOLIA_ADMIN_API_KEY', 'EASYPOST_API_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_ALGOLIA_APP_ID', 'NEXT_PUBLIC_ALGOLIA_SEARCH_KEY',
    'NEXT_PUBLIC_POSTHOG_KEY', 'NEXT_PUBLIC_POSTHOG_HOST',
    'NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL'
)

$added = 0
$errors = 0

foreach ($name in $envVars.Keys | Sort-Object) {
    $value = $envVars[$name]
    
    # Show what we're adding
    $isCritical = $mustHave -contains $name
    $prefix = if ($isCritical) { "🔴" } else { "🔵" }
    
    Write-Host "$prefix $name" -NoNewline
    
    try {
        # Create temp file with value
        $tempFile = [System.IO.Path]::GetTempFileName()
        Set-Content -Path $tempFile -Value $value -NoNewline
        
        # Add to all 3 environments
        Get-Content $tempFile | vercel env add $name production development preview --force 2>&1 | Out-Null
        
        Remove-Item $tempFile
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $added++
        } else {
            Write-Host " ❌ Failed" -ForegroundColor Red
            $errors++
        }
    } catch {
        Write-Host " ❌ Error: $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 SYNC COMPLETE" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ Successfully added: $added variables" -ForegroundColor Green
Write-Host "❌ Errors: $errors variables" -ForegroundColor Red
Write-Host ("=" * 60) + "`n" -ForegroundColor Cyan

if ($added -gt 0) {
    Write-Host "🎉 Environment variables synced to Vercel!" -ForegroundColor Green
    Write-Host "`n🔄 Redeploy your site for changes to take effect.`n" -ForegroundColor Yellow
}

