# fix-logger-remaining.ps1
# Script to fix remaining specific logger patterns that regex might miss

param(
    [switch]$DryRun = $false,
    [string]$BackupDir = ".backup-logger-fixes-remaining"
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

# Specific files and patterns to fix
$fixes = @(
    @{
        File = "app/api/v1/community/soapstones/[id]/reply/route.ts"
        Pattern = "logger\.warn\('Soapstone reply requested for ID:', soapstoneId\);"
        Replacement = "logger.warn('Soapstone reply requested for ID:', undefined, { value: soapstoneId });"
    },
    @{
        File = "app/api/v1/community/soapstones/[id]/reply/route.ts"
        Pattern = "logger\.error\('Error replying to soapstone:', error\);"
        Replacement = "logger.error('Error replying to soapstone:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));"
    },
    @{
        File = "app/api/v1/leaderboards/[gameId]/route.ts"
        Pattern = "logger\.warn\('Friend table not available, using user-only scope:', err\.message\);"
        Replacement = "logger.warn('Friend table not available, using user-only scope:', undefined, { value: err.message });"
    },
    @{
        File = "app/api/v1/leaderboards/[gameId]/route.ts"
        Pattern = "logger\.error\('Leaderboard error:', error\);"
        Replacement = "logger.error('Leaderboard error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));"
    },
    @{
        File = "app/api/v1/parties/invitations/[id]/route.ts"
        Pattern = "logger\.warn\('Invitation updated:', \{\s*id: updatedInvitation\.id,\s*status: updatedInvitation\.status,\s*\}\);"
        Replacement = "logger.warn('Invitation updated:', undefined, {`n      id: updatedInvitation.id,`n      status: updatedInvitation.status,`n    });"
    }
)

$totalFiles = 0
$modifiedFiles = 0
$totalReplacements = 0

foreach ($fix in $fixes) {
    $filePath = $fix.File
    if (-not (Test-Path $filePath)) {
        Write-Host "[SKIP] File not found: $filePath" -ForegroundColor Red
        continue
    }
    
    $totalFiles++
    try {
        $content = Get-Content $filePath -Raw -ErrorAction Stop
    } catch {
        try {
            $content = (Get-Content $filePath) -join "`n"
        } catch {
            Write-Host "[SKIP] Cannot read: $filePath" -ForegroundColor Red
            continue
        }
    }
    
    if ([string]::IsNullOrEmpty($content)) {
        continue
    }
    
    $original = $content
    $fileReplacements = 0
    
    # Try to match and replace
    if ($content -match $fix.Pattern) {
        $content = $content -replace $fix.Pattern, $fix.Replacement
        $fileReplacements++
        Write-Host "  [FIX] $filePath - Pattern matched" -ForegroundColor Yellow
    }
    
    if ($fileReplacements -gt 0 -and $content -ne $original) {
        $modifiedFiles++
        $totalReplacements += $fileReplacements
        
        if ($DryRun) {
            Write-Host "[DRY RUN] Would modify: $filePath ($fileReplacements changes)" -ForegroundColor Cyan
        } else {
            # Create backup
            $relativePath = $filePath.Replace((Get-Location).Path + "\", "")
            $backupPath = Join-Path $BackupDir $relativePath
            $backupDirPath = Split-Path $backupPath -Parent
            if (-not (Test-Path $backupDirPath)) {
                New-Item -ItemType Directory -Path $backupDirPath -Force | Out-Null
            }
            Copy-Item $filePath $backupPath -Force
            
            # Write modified content
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "[MODIFIED] $filePath ($fileReplacements changes)" -ForegroundColor Green
        }
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total files processed: $totalFiles"
Write-Host "Files with changes: $modifiedFiles"
Write-Host "Total replacements: $totalReplacements"

if ($DryRun) {
    Write-Host "`n[DRY RUN] No files were modified. Run without -DryRun to apply changes." -ForegroundColor Yellow
} else {
    Write-Host "`nBackups saved to: $BackupDir" -ForegroundColor Green
}

