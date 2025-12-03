# fix-logger-calls-comprehensive.ps1
# Comprehensive script to fix ALL remaining logger call patterns

param(
    [switch]$DryRun = $false,
    [string]$BackupDir = ".backup-logger-fixes-comprehensive"
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
    
    # Pattern 1: logger.error('msg', error) where error is unknown - MUST check if already fixed
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*(\w+)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $errorVar = $match.Groups[2].Value
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined," -and $match.Value -notmatch "instanceof Error") {
            $replacement = "logger.error('$msg', undefined, undefined, $errorVar instanceof Error ? $errorVar : new Error(String($errorVar)));"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 1] $($file.Name):$($match.Index) - logger.error('$msg', $errorVar)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 2: logger.warn('msg', 'string literal') -> logger.warn('msg', undefined, { value: 'string literal' })
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*'([^']+)'\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $str = $match.Groups[2].Value
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.warn('$msg', undefined, { value: '$str' });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 2] $($file.Name):$($match.Index) - logger.warn('$msg', '$str')" -ForegroundColor Yellow
        }
    }
    
    # Pattern 3: logger.warn('msg', variable) where variable is string type -> logger.warn('msg', undefined, { value: variable })
    # Match simple variable names that aren't already objects or method calls
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $varName = $match.Groups[2].Value
        # Skip if already fixed, or if it's a known safe pattern
        # But DO fix: soapstoneId, err.message, and other property accesses
        if ($match.Value -notmatch "undefined," -and 
            $varName -notmatch "^(undefined|null|true|false)$") {
            $replacement = "logger.warn('$msg', undefined, { value: $varName });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 3] $($file.Name):$($match.Index) - logger.warn('$msg', $varName)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 4: logger.warn('msg', { id: ... }) or other non-LogCtx properties -> logger.warn('msg', undefined, { id: ... })
    # Match object literals that might have non-LogCtx properties (including multiline)
    # Use a more flexible pattern that handles multiline objects
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*(\{[^}]*\})\);", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $obj = $match.Groups[2].Value
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.warn('$msg', undefined, $obj);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 4] $($file.Name):$($match.Index) - logger.warn('$msg', { ... })" -ForegroundColor Yellow
        }
    }
    
    # Pattern 5: logger.error('msg', { ... }) -> logger.error('msg', undefined, { ... }, undefined)
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*(\{[^}]+\})\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $obj = $match.Groups[2].Value
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.error('$msg', undefined, $obj, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 5] $($file.Name):$($match.Index) - logger.error('$msg', { ... })" -ForegroundColor Yellow
        }
    }
    
    # Pattern 6: logger.error('msg', zodError) -> logger.error('msg', undefined, { error: zodError }, undefined)
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]*\.error)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $errorVar = $match.Groups[2].Value
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.error('$msg', undefined, { error: $errorVar }, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 6] $($file.Name):$($match.Index) - logger.error('$msg', $errorVar)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 7: logger.error('msg', number, string) -> logger.error('msg', undefined, { status: number, text: string }, undefined)
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*(\d+),\s*([^)]+)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $num = $match.Groups[2].Value
        $str = $match.Groups[3].Value.Trim()
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.error('$msg', undefined, { status: $num, text: $str }, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 7] $($file.Name):$($match.Index) - logger.error('$msg', $num, $str)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 8: logger.warn('msg', req.headers.get('x') or request.headers.get('x')) -> logger.warn('msg', undefined, { value: ... })
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*([^)]+\.get\([^)]+\))\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $arg = $match.Groups[2].Value.Trim()
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.warn('$msg', undefined, { value: $arg });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 8] $($file.Name):$($match.Index) - logger.warn('$msg', $arg)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 9: logger.warn('msg', params.id or params.slug) -> logger.warn('msg', undefined, { value: ... })
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*(params\.[a-zA-Z]+)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $arg = $match.Groups[2].Value.Trim()
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.warn('$msg', undefined, { value: $arg });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 9] $($file.Name):$($match.Index) - logger.warn('$msg', $arg)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 10: logger.error('msg', string) -> logger.error('msg', undefined, { value: string }, undefined)
    # This catches string literals passed to logger.error
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*'([^']+)'\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $str = $match.Groups[2].Value
        # Only fix if NOT already in the correct format
        if ($match.Value -notmatch "undefined,") {
            $replacement = "logger.error('$msg', undefined, { value: '$str' }, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 10] $($file.Name):$($match.Index) - logger.error('$msg', '$str')" -ForegroundColor Yellow
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
    Write-Host "To apply changes, run: .\fix-logger-calls-comprehensive.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`nBackups saved to: $BackupDir" -ForegroundColor Green
    Write-Host "To restore: Copy files from $BackupDir back to app/api/" -ForegroundColor Yellow
}

