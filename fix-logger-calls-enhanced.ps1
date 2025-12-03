# fix-logger-calls-enhanced.ps1
# Enhanced script to fix remaining logger call patterns

param(
    [switch]$DryRun = $false,
    [string]$BackupDir = ".backup-logger-fixes-enhanced"
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
    
    # Pattern 5: logger.warn('msg', stringVar) where stringVar could be null -> logger.warn('msg', undefined, { value: stringVar })
    # Match: logger.warn('msg', something.get('header')) or logger.warn('msg', variable)
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*([^)]+)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $arg = $match.Groups[2].Value.Trim()
        # Skip if already has undefined or is an object literal
        if ($arg -notmatch "^(undefined|null|true|false|\{)" -and $arg -notmatch "undefined,") {
            $replacement = "logger.warn('$msg', undefined, { value: $arg });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 5] $($file.Name) - logger.warn('$msg', $arg)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 6: logger.error('msg', zodError) -> logger.error('msg', undefined, { error: zodError }, undefined)
    # Match: logger.error('msg', validated.error) or logger.error('msg', parseResult.error)
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]*\.error)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $errorVar = $match.Groups[2].Value
        $replacement = "logger.error('$msg', undefined, { error: $errorVar }, undefined);"
        $content = $content -replace [regex]::Escape($match.Value), $replacement
        $fileReplacements++
        Write-Host "  [Pattern 6] $($file.Name) - logger.error('$msg', $errorVar)" -ForegroundColor Yellow
    }
    
    # Pattern 7: logger.error('msg', number, string) -> logger.error('msg', undefined, { status: number, text: string }, undefined)
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*(\d+),\s*([^)]+)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $num = $match.Groups[2].Value
        $str = $match.Groups[3].Value.Trim()
        $replacement = "logger.error('$msg', undefined, { status: $num, text: $str }, undefined);"
        $content = $content -replace [regex]::Escape($match.Value), $replacement
        $fileReplacements++
        Write-Host "  [Pattern 7] $($file.Name) - logger.error('$msg', $num, $str)" -ForegroundColor Yellow
    }
    
    # Pattern 8: logger.warn('msg', { custom: fields }) where custom fields aren't LogCtx -> logger.warn('msg', undefined, { custom: fields })
    # This is a catch-all for object literals that might have been missed
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*(\{[^}]+\})\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $obj = $match.Groups[2].Value
        # Check if it already has undefined
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.warn('$msg', undefined, $obj);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 8] $($file.Name) - logger.warn('$msg', { ... })" -ForegroundColor Yellow
        }
    }
    
    # Pattern 9: logger.error('msg', { custom: fields }) -> logger.error('msg', undefined, { custom: fields }, undefined)
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*(\{[^}]+\})\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $obj = $match.Groups[2].Value
        # Check if it already has undefined
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.error('$msg', undefined, $obj, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 9] $($file.Name) - logger.error('$msg', { ... })" -ForegroundColor Yellow
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

