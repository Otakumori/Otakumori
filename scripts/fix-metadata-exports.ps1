# Fix generateMetadata exports in client components
$files = @(
    "app/admin/page.tsx",
    "app/admin/burst/page.tsx",
    "app/admin/cosmetics/page.tsx",
    "app/admin/discounts/page.tsx",
    "app/admin/economy/page.tsx",
    "app/admin/external-sync/page.tsx",
    "app/admin/flags/page.tsx",
    "app/admin/media/page.tsx",
    "app/admin/music/page.tsx",
    "app/admin/nsfw/page.tsx",
    "app/admin/petal-shop/page.tsx",
    "app/admin/printify/page.tsx",
    "app/admin/reviews/page.tsx",
    "app/admin/rewards/page.tsx",
    "app/admin/runes/page.tsx",
    "app/admin/settings/page.tsx",
    "app/admin/soapstones/page.tsx",
    "app/admin/unauthorized/page.tsx",
    "app/admin/users/page.tsx",
    "app/admin/vouchers/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Remove generateMetadata function export
        $content = $content -replace "export function generateMetadata\(\) \{[^}]*\}[\r\n]*", ""
        
        # Remove generateSEO import if it exists
        $content = $content -replace "import \{ generateSEO \} from '@/app/lib/seo';[\r\n]*", ""
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}

