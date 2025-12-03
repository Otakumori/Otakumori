# fix-logger-calls-safe.ps1
# Safe script to fix logger calls with backups and dry-run mode

param(
    [switch]$DryRun = $false,
    [string]$BackupDir = ".backup-logger-fixes"
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
    
    # Pattern 1: logger.error('msg', error) -> logger.error('msg', undefined, undefined, error instanceof Error ? error : new Error(String(error)))
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*(\w+)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $errorVar = $match.Groups[2].Value
        $replacement = "logger.error('$msg', undefined, undefined, $errorVar instanceof Error ? $errorVar : new Error(String($errorVar)));"
        $content = $content -replace [regex]::Escape($match.Value), $replacement
        $fileReplacements++
        Write-Host "  [Pattern 1] $($file.Name):$($match.Index) - logger.error('$msg', $errorVar)" -ForegroundColor Yellow
    }
    
    # Pattern 2: logger.warn('msg', { ... }) -> logger.warn('msg', undefined, { ... })
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*(\{[^}]+\})\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $obj = $match.Groups[2].Value
        $replacement = "logger.warn('$msg', undefined, $obj);"
        $content = $content -replace [regex]::Escape($match.Value), $replacement
        $fileReplacements++
        Write-Host "  [Pattern 2] $($file.Name):$($match.Index) - logger.warn('$msg', { ... })" -ForegroundColor Yellow
    }
    
    # Pattern 3: logger.warn('msg', stringVar) -> logger.warn('msg', undefined, { value: stringVar })
    # Only match if it's a simple variable name (not already an object)
    $matches = [regex]::Matches($content, "logger\.warn\('([^']+)',\s*([a-zA-Z_$][a-zA-Z0-9_$.]*)\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $varName = $match.Groups[2].Value
        # Skip if it's already been fixed or is a known safe pattern
        if ($varName -notmatch "^(undefined|null|true|false)$") {
            $replacement = "logger.warn('$msg', undefined, { value: $varName });"
            $content = $content -replace [regex]::Escape($match.Value), $replacement
            $fileReplacements++
            Write-Host "  [Pattern 3] $($file.Name):$($match.Index) - logger.warn('$msg', $varName)" -ForegroundColor Yellow
        }
    }
    
    # Pattern 4: logger.error('msg', { ... }) -> logger.error('msg', undefined, { ... }, undefined)
    $matches = [regex]::Matches($content, "logger\.error\('([^']+)',\s*(\{[^}]+\})\);")
    foreach ($match in $matches) {
        $msg = $match.Groups[1].Value
        $obj = $match.Groups[2].Value
        $replacement = "logger.error('$msg', undefined, $obj, undefined);"
        $content = $content -replace [regex]::Escape($match.Value), $replacement
        $fileReplacements++
        Write-Host "  [Pattern 4] $($file.Name):$($match.Index) - logger.error('$msg', { ... })" -ForegroundColor Yellow
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

