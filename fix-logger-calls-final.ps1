# fix-logger-calls-final.ps1
# Final comprehensive script to fix all remaining logger call patterns

param(
    [switch]$DryRun = $false,
    [string]$BackupDir = ".backup-logger-fixes-final"
)

$ErrorActionPreference = "Stop"

# Create backup directory if not dry-run
if (-not $DryRun) {
    if (Test-Path $BackupDir) {
        Remove-Item $BackupDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Backup directory created: $BackupDir" -ForegroundColor Green
}

# Find all TypeScript files in app/api
$files = Get-ChildItem -Path "app/api" -Recurse -Filter "*.ts" | 
    Where-Object { 
        $_.FullName -notmatch "node_modules" -and
        $_.FullName -notmatch "\.d\.ts$"
    }

$totalFiles = 0
$modifiedFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    # Skip if file doesn't exist
    if (-not (Test-Path $file.FullName)) {
        continue
    }
    
    $totalFiles++
    # Use -Raw if available, otherwise join lines
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
    } catch {
        try {
            $content = (Get-Content $file.FullName) -join "`n"
        } catch {
            Write-Host "[SKIP] File not found or inaccessible: $($file.FullName)" -ForegroundColor Red
            continue
        }
    }
    
    # Skip if content is null or empty
    if ([string]::IsNullOrEmpty($content)) {
        continue
    }
    
    $original = $content
    $fileReplacements = 0
    
    # Pattern A: logger.warn('msg', req.headers.get('x') or request.headers.get('x')) -> logger.warn('msg', undefined, { value: ... })
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*([^)]+\.get\([^)]+\))\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $arg = $match.Groups[2].Value.Trim()
        # Skip if already fixed
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.warn('$msg', undefined, { value: $arg });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern A] $($file.Name) - logger.warn('$msg', $arg)" -ForegroundColor Yellow
        }
    }
    
    # Pattern B: logger.warn('msg', params.id or params.slug) -> logger.warn('msg', undefined, { value: ... })
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*(params\.[a-zA-Z]+)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $arg = $match.Groups[2].Value.Trim()
        # Skip if already fixed
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.warn('$msg', undefined, { value: $arg });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern B] $($file.Name) - logger.warn('$msg', $arg)" -ForegroundColor Yellow
        }
    }
    
    # Pattern C: logger.error('msg', error) where error is unknown -> logger.error('msg', undefined, undefined, error)
    # This catches cases where error variable exists but wasn't caught by previous patterns
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*(\w+)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $errorVar = $match.Groups[2].Value
        # Skip if already has the proper format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.error('$msg', undefined, undefined, $errorVar instanceof Error ? $errorVar : new Error(String($errorVar)));"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern C] $($file.Name) - logger.error('$msg', $errorVar)" -ForegroundColor Yellow
        }
    }
    
    # Pattern D: logger.warn('msg', variable) where variable is string|null -> logger.warn('msg', undefined, { value: variable })
    # Match simple variable names that aren't already objects
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $varName = $match.Groups[2].Value
        # Skip if already fixed, or if it's a known safe pattern, or if it's a method call (handled by Pattern A)
        if ($match.Value -notmatch "undefined," -and 
            $varName -notmatch "^(undefined|null|true|false)$" -and
            $varName -notmatch "\.get\(" -and
            $varName -notmatch "^params\.") {
            $replacement = "logger.warn('$msg', undefined, { value: $varName });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern D] $($file.Name) - logger.warn('$msg', $varName)" -ForegroundColor Yellow
        }
    }
    
    if ($fileReplacements -gt 0) {
        $modifiedFiles++
        $totalReplacements += $fileReplacements
        
        if ($DryRun) {
            Write-Host "[DRY RUN] Would modify: $($file.FullName) ($fileReplacements changes)" -ForegroundColor Cyan
        } else {
            # Create backup
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
            $backupPath = Join-Path $BackupDir $relativePath
            $backupDirPath = Split-Path $backupPath -Parent
            if (-not (Test-Path $backupDirPath)) {
                New-Item -ItemType Directory -Path $backupDirPath -Force | Out-Null
            }
            Copy-Item $file.FullName $backupPath -Force
            
            # Write modified content
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "[MODIFIED] $($file.FullName) ($fileReplacements changes)" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total files scanned: $totalFiles"
Write-Host "Files with changes: $modifiedFiles"
Write-Host "Total replacements: $totalReplacements"

if ($DryRun) {
    Write-Host "`n[DRY RUN] No files were modified. Run without -DryRun to apply changes." -ForegroundColor Yellow
} else {
    Write-Host "`nBackups saved to: $BackupDir" -ForegroundColor Green
    Write-Host "To restore: Copy files from $BackupDir back to app/api/" -ForegroundColor Yellow
}

