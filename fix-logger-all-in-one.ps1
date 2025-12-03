# fix-logger-all-in-one.ps1
# Comprehensive script to fix ALL logger call patterns in one run

param(
    [switch]$DryRun = $false,
    [string]$BackupDir = ".backup-logger-fixes-all"
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
    if (-not (Test-Path $file.FullName)) {
        continue
    }
    
    $totalFiles++
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
    } catch {
        try {
            $content = (Get-Content $file.FullName) -join "`n"
        } catch {
            continue
        }
    }
    
    if ([string]::IsNullOrEmpty($content)) {
        continue
    }
    
    $original = $content
    $fileReplacements = 0
    
    # Pattern 1: logger.error('msg', error) -> logger.error('msg', undefined, undefined, error instanceof Error ? error : new Error(String(error)))
    # Only fix if NOT already in correct format
    # Match: logger.error('message', errorVariable);
    $pattern1Str = "logger\.error\('([^']+)',\s*(\w+)\);"
    $matches = [regex]::Matches($content, $pattern1Str)
    foreach ($match in $matches) {
        if ($match.Value -notmatch "undefined," -and $match.Value -notmatch "instanceof Error") {
            $msg = $match.Groups[1].Value
            $errorVar = $match.Groups[2].Value
            $replacement = "logger.error('$msg', undefined, undefined, $errorVar instanceof Error ? $errorVar : new Error(String($errorVar)));"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 1] $($file.Name) - logger.error('$msg', $errorVar)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 2: logger.warn('msg', 'string literal') -> logger.warn('msg', undefined, { value: 'string literal' })
    $pattern2Str = "logger\.warn\('([^']+)',\s*'([^']+)'\);"
    $matches = [regex]::Matches($content, $pattern2Str)
    foreach ($match in $matches) {
        if ($match.Value -notmatch "undefined,") {
            $msg = $match.Groups[1].Value
            $str = $match.Groups[2].Value
            $replacement = "logger.warn('$msg', undefined, { value: '$str' });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 2] $($file.Name) - logger.warn('$msg', '$str')" -ForegroundColor Yellow
        }
    }
    
    # Pattern 3: logger.warn('msg', variable) -> logger.warn('msg', undefined, { value: variable })
    # Match variables, property accesses, but skip already-fixed patterns
    $pattern3Str = "logger\.warn\('([^']+)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]+)\);"
    $matches = [regex]::Matches($content, $pattern3Str)
    foreach ($match in $matches) {
        if ($match.Value -notmatch "undefined,") {
            $varName = $match.Groups[2].Value
            # Skip safe patterns
            if ($varName -notmatch "^(undefined|null|true|false)$") {
                $msg = $match.Groups[1].Value
                $replacement = "logger.warn('$msg', undefined, { value: $varName });"
                $content = $content -replace [regex]::Escape($match.Value), $replacement
                $fileReplacements++
                Write-Host "  [Pattern 3] $($file.Name) - logger.warn('$msg', $varName)" -ForegroundColor Yellow
            }
        }
    }
    
    # Pattern 4: logger.warn('msg', { ... }) -> logger.warn('msg', undefined, { ... })
    # Handle multiline objects with Singleline option
    $pattern4 = [regex]::new("logger\.warn\('([^']+)',\s*(\{[^}]*\})\);", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $matches = $pattern4.Matches($content)
    foreach ($match in $matches) {
        if ($match.Value -notmatch "undefined,") {
            $msg = $match.Groups[1].Value
            $obj = $match.Groups[2].Value
            $replacement = "logger.warn('$msg', undefined, $obj);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 4] $($file.Name) - logger.warn('$msg', { ... })" -ForegroundColor Yellow
        }
    }
    
    # Pattern 5: logger.error('msg', { ... }) -> logger.error('msg', undefined, { ... }, undefined)
    $pattern5 = [regex]::new("logger\.error\('([^']+)',\s*(\{[^}]*\})\);", [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $matches = $pattern5.Matches($content)
    foreach ($match in $matches) {
        if ($match.Value -notmatch "undefined,") {
            $msg = $match.Groups[1].Value
            $obj = $match.Groups[2].Value
            $replacement = "logger.error('$msg', undefined, $obj, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 5] $($file.Name) - logger.error('$msg', { ... })" -ForegroundColor Yellow
        }
    }
    
    # Pattern 6: logger.error('msg', zodError.error) -> logger.error('msg', undefined, { error: zodError.error }, undefined)
    $pattern6Str = "logger\.error\('([^']+)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]*\.error)\);"
    $matches = [regex]::Matches($content, $pattern6Str)
    foreach ($match in $matches) {
        if ($match.Value -notmatch "undefined,") {
            $msg = $match.Groups[1].Value
            $errorVar = $match.Groups[2].Value
            $replacement = "logger.error('$msg', undefined, { error: $errorVar }, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 6] $($file.Name) - logger.error('$msg', $errorVar)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 7: logger.error('msg', number, string) -> logger.error('msg', undefined, { status: number, text: string }, undefined)
    $pattern7Str = "logger\.error\('([^']+)',\s*(\d+),\s*([^)]+)\);"
    $matches = [regex]::Matches($content, $pattern7Str)
    foreach ($match in $matches) {
        if ($match.Value -notmatch "undefined,") {
            $msg = $match.Groups[1].Value
            $num = $match.Groups[2].Value
            $str = $match.Groups[3].Value.Trim()
            $replacement = "logger.error('$msg', undefined, { status: $num, text: $str }, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 7] $($file.Name) - logger.error('$msg', $num, $str)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 8: logger.error('msg', 'string') -> logger.error('msg', undefined, { value: 'string' }, undefined)
    $pattern8Str = "logger\.error\('([^']+)',\s*'([^']+)'\);"
    $matches = [regex]::Matches($content, $pattern8Str)
    foreach ($match in $matches) {
        if ($match.Value -notmatch "undefined,") {
            $msg = $match.Groups[1].Value
            $str = $match.Groups[2].Value
            $replacement = "logger.error('$msg', undefined, { value: '$str' }, undefined);"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 8] $($file.Name) - logger.error('$msg', '$str')" -ForegroundColor Yellow
        }
    }
    
    if ($fileReplacements -gt 0 -and $content -ne $original) {
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
    Write-Host "To apply: .\fix-logger-all-in-one.ps1" -ForegroundColor Cyan
} else {
    Write-Host "`nBackups saved to: $BackupDir" -ForegroundColor Green
    Write-Host "To restore: Copy files from $BackupDir back to app/api/" -ForegroundColor Yellow
}

