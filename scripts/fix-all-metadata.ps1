# Fix ALL generateMetadata exports in client components
$allFiles = Get-ChildItem -Path "app" -Filter "*.tsx" -Recurse | Where-Object { 
    $content = Get-Content $_.FullName | Out-String
    $content -match "'use client'" -and $content -match "export function generateMetadata"
}

Write-Host "Found $($allFiles.Count) files to fix"

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName | Out-String
    
    # Remove generateMetadata function export (handles multiline)
    $content = $content -replace "(?s)export function generateMetadata\(\) \{.*?\}[\r\n]*", ""
    
    # Remove generateSEO import if it exists
    $content = $content -replace "import \{ generateSEO \} from '@/app/lib/seo';[\r\n]*", ""
    
    # Write back
    $content | Set-Content $file.FullName -NoNewline
    Write-Host "Fixed: $($file.FullName)"
}

Write-Host "`nDone! Fixed $($allFiles.Count) files"

