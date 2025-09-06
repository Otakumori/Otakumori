$ErrorActionPreference = "Stop"

Write-Host "› Typecheck"
pnpm typecheck

Write-Host "› Lint"
pnpm lint

Write-Host "› Build"
pnpm build

Write-Host "› Duplicate component basenames"
$dupes = (Get-ChildItem app/components -Recurse -Filter *.tsx | % { $_.Name } | Sort-Object | Group-Object | ? { $_.Count -gt 1 } | % { $_.Name })
if ($dupes.Count -gt 0) {
  Write-Error "Duplicate components: $($dupes -join ', ')"
}

Write-Host "› Orphan scan"
npx -y knip --production

Write-Host "› Asset integrity"
$changed = (git diff --name-only -- public/assets)
if ($changed) {
  Write-Error "public/assets changed (forbidden): `n$changed"
}

Write-Host "All sanity checks passed."
