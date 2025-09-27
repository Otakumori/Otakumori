# Vercel Environment Variables Manager - PowerShell Wrapper
# 
# Usage:
#   .\scripts\vercel-env-manager.ps1                    # Audit only
#   .\scripts\vercel-env-manager.ps1 -Apply            # Audit and fix
#   .\scripts\vercel-env-manager.ps1 -Verbose          # Detailed output
#   .\scripts\vercel-env-manager.ps1 -Apply -Verbose   # Fix with details

param(
    [switch]$Apply,
    [switch]$Verbose,
    [string]$VercelToken = $env:VERCEL_TOKEN
)

# Colors for output
$ErrorColor = "Red"
$WarningColor = "Yellow" 
$SuccessColor = "Green"
$InfoColor = "Cyan"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        throw "Node.js not found"
    }
} catch {
    Write-ColorOutput "❌ Node.js is required but not found in PATH" $ErrorColor
    Write-ColorOutput "   Install Node.js from: https://nodejs.org/" $InfoColor
    exit 1
}

# Check if Vercel token is provided
if (-not $VercelToken) {
    Write-ColorOutput "❌ VERCEL_TOKEN is required" $ErrorColor
    Write-ColorOutput "   Get a token from: https://vercel.com/account/tokens" $InfoColor
    Write-ColorOutput "   Usage: `$env:VERCEL_TOKEN='your_token'; .\scripts\vercel-env-manager.ps1" $InfoColor
    exit 1
}

# Set environment variable for the Node script
$env:VERCEL_TOKEN = $VercelToken

# Build arguments for Node script
$nodeArgs = @()
if ($Apply) {
    $nodeArgs += "--apply"
}
if ($Verbose) {
    $nodeArgs += "--verbose"
}

# Get script directory and construct path to Node script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeScript = Join-Path $scriptDir "vercel-env-manager.mjs"

# Check if Node script exists
if (-not (Test-Path $nodeScript)) {
    Write-ColorOutput "❌ Node script not found: $nodeScript" $ErrorColor
    exit 1
}

Write-ColorOutput "🚀 Starting Vercel Environment Variables Manager..." $InfoColor
Write-ColorOutput "   Node.js version: $nodeVersion" $InfoColor
Write-ColorOutput "   Script: $nodeScript" $InfoColor

if ($Apply) {
    Write-ColorOutput "   Mode: AUDIT + APPLY FIXES" $WarningColor
} else {
    Write-ColorOutput "   Mode: AUDIT ONLY" $InfoColor
}

Write-ColorOutput ""

# Run the Node script
try {
    if ($nodeArgs.Count -gt 0) {
        & node $nodeScript $nodeArgs
    } else {
        & node $nodeScript
    }
    
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-ColorOutput "`n✅ Script completed successfully!" $SuccessColor
    } else {
        Write-ColorOutput "`n❌ Script failed with exit code: $exitCode" $ErrorColor
        exit $exitCode
    }
} catch {
    Write-ColorOutput "`n💥 Failed to run Node script: $($_.Exception.Message)" $ErrorColor
    exit 1
}

# Additional Windows-specific tips
Write-ColorOutput "`n💡 WINDOWS TIPS:" $InfoColor
Write-ColorOutput "   • Run in PowerShell (not Command Prompt) for best experience" $InfoColor
Write-ColorOutput "   • Use PowerShell ISE or VS Code terminal for colored output" $InfoColor
Write-ColorOutput "   • Set execution policy if needed: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" $InfoColor
