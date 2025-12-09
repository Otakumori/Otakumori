# PowerShell Script to Export Blender Model to GLB
# Automates the conversion process

$ErrorActionPreference = "Stop"

Write-Host "🎨 Blender Model Export Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Paths
$projectRoot = $PWD.Path
$blendFile = Join-Path $projectRoot "Goth Girl Sara Release Model v1.2.blend"
$outputFile = Join-Path $projectRoot "public\models\goth-girl-sara.glb"
$pythonScript = Join-Path $projectRoot "scripts\blender-export.py"

# Check if blend file exists
if (-not (Test-Path $blendFile)) {
    Write-Host "❌ Error: Blend file not found at:" -ForegroundColor Red
    Write-Host "   $blendFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found blend file: Goth Girl Sara Release Model v1.2.blend" -ForegroundColor Green

# Common Blender installation paths on Windows
$blenderPaths = @(
    "C:\Program Files\Blender Foundation\Blender 4.2\blender.exe",
    "C:\Program Files\Blender Foundation\Blender 4.1\blender.exe",
    "C:\Program Files\Blender Foundation\Blender 4.0\blender.exe",
    "C:\Program Files\Blender Foundation\Blender 3.6\blender.exe",
    "C:\Program Files\Blender Foundation\Blender 3.5\blender.exe",
    "C:\Program Files\Blender Foundation\Blender\blender.exe",
    "$env:ProgramFiles\Blender Foundation\Blender\blender.exe"
)

# Find Blender
$blenderExe = $null
foreach ($path in $blenderPaths) {
    if (Test-Path $path) {
        $blenderExe = $path
        break
    }
}

# Check if Blender is in PATH
if (-not $blenderExe) {
    try {
        $blenderInPath = Get-Command blender -ErrorAction Stop
        $blenderExe = $blenderInPath.Source
    } catch {
        Write-Host "❌ Error: Blender not found!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please install Blender or specify the path manually:" -ForegroundColor Yellow
        Write-Host '  $env:BLENDER_PATH = "C:\Path\To\blender.exe"' -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Download Blender: https://www.blender.org/download/" -ForegroundColor Cyan
        exit 1
    }
}

Write-Host "✅ Found Blender at: $blenderExe" -ForegroundColor Green
Write-Host ""

# Create output directory
$outputDir = Split-Path $outputFile -Parent
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    Write-Host "✅ Created output directory: $outputDir" -ForegroundColor Green
}

# Run Blender export
Write-Host "🚀 Starting Blender export (this may take 1-2 minutes)..." -ForegroundColor Yellow
Write-Host ""

try {
    & $blenderExe `
        --background `
        "$blendFile" `
        --python "$pythonScript" `
        -- `
        "$outputFile"
    
    Write-Host ""
    if (Test-Path $outputFile) {
        $fileSize = (Get-Item $outputFile).Length / 1MB
        Write-Host "🎉 SUCCESS! Model exported!" -ForegroundColor Green
        Write-Host "   File: $outputFile" -ForegroundColor Cyan
        Write-Host "   Size: $($fileSize.ToString('F2')) MB" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✨ Next step: Test it!" -ForegroundColor Magenta
        Write-Host "   Navigate to: http://localhost:3000/test/sara-creator" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Export completed but file not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Export failed: $_" -ForegroundColor Red
    exit 1
}

