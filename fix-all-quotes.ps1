# PowerShell script to fix corrupted quotes in all TypeScript/JavaScript files
$files = Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" | Where-Object { 
    $_.FullName -notmatch "node_modules|\.next|dist|build|\.git" 
}

$fixedCount = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        if ($content -match '\{\"'\}') {
            $newContent = $content -replace '\{\"'\}', "'"
            Set-Content -Path $file.FullName -Value $newContent -NoNewline -Encoding UTF8
            Write-Host "Fixed: $($file.Name)"
            $fixedCount++
        }
    }
    catch {
        Write-Host "Error processing $($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "Fixed quotes in $fixedCount files."
