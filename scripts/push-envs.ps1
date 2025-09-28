param(
  [string]$EnvFile = ".\.env.local",
  [string]$Scope = "production" # or "preview" or "development"
)

if (!(Test-Path $EnvFile)) { 
  Write-Error "Env file not found: $EnvFile"; 
  exit 1 
}

Write-Host "Pushing environment variables from $EnvFile to Vercel ($Scope)..." -ForegroundColor Green

$lines = Get-Content $EnvFile | Where-Object { $_ -match "^\s*([A-Z0-9_]+)\s*=" }
foreach ($line in $lines) {
  if ($line -match "^\s*([A-Z0-9_]+)\s*=\s*(.*)$") {
    $name = $Matches[1]
    $val = $Matches[2]
    
    # Skip empty values and comments
    if ($val -eq "" -or $val -match "^#") { 
      Write-Host "Skipping $name (empty or comment)" -ForegroundColor Yellow
      continue 
    }
    
    # Skip TODO placeholders
    if ($val -match "TODO_PASTE") {
      Write-Host "Skipping $name (TODO placeholder)" -ForegroundColor Yellow
      continue
    }
    
    Write-Host "Adding $name to Vercel ($Scope)..." -ForegroundColor Cyan
    
    try {
      # Use echo to pipe the value to vercel env add
      $processInfo = New-Object System.Diagnostics.ProcessStartInfo
      $processInfo.FileName = "vercel"
      $processInfo.Arguments = "env add $name $Scope"
      $processInfo.UseShellExecute = $false
      $processInfo.RedirectStandardInput = $true
      $processInfo.RedirectStandardOutput = $true
      $processInfo.RedirectStandardError = $true
      
      $process = New-Object System.Diagnostics.Process
      $process.StartInfo = $processInfo
      $process.Start() | Out-Null
      
      # Write the value to stdin
      $process.StandardInput.WriteLine($val)
      $process.StandardInput.Close()
      
      # Wait for completion
      $process.WaitForExit()
      
      if ($process.ExitCode -eq 0) {
        Write-Host "✓ $name added successfully" -ForegroundColor Green
      } else {
        $errorOutput = $process.StandardError.ReadToEnd()
        Write-Host "✗ Failed to add $name" -ForegroundColor Red
        Write-Host $errorOutput -ForegroundColor Red
      }
    }
    catch {
      Write-Host "✗ Error adding $name : $($_.Exception.Message)" -ForegroundColor Red
    }
  }
}

Write-Host "Environment variable push completed!" -ForegroundColor Green
