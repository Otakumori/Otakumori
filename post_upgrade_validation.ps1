#-------------------------
# Post-upgrade validation script (PowerShell)
#-------------------------
# Usage: .\post_upgrade_validation.ps1
# This script runs the same queries as the pre-upgrade script
# to validate that the upgrade completed successfully.

param(
    [string]$PGHOST = "your-db-host",
    [string]$PGPORT = "5432",
    [string]$PGUSER = "postgres",
    [string]$PGDATABASE = "postgres",
    [SecureString]$PGPASSWORD = (New-Object SecureString)
)

# Use environment variables if available, otherwise use parameters
if ($env:POSTGRES_POSTGRES_HOST) { $PGHOST = $env:POSTGRES_POSTGRES_HOST }
if ($env:PGHOST) { $PGHOST = $env:PGHOST }
if ($env:POSTGRES_POSTGRES_USER) { $PGUSER = $env:POSTGRES_POSTGRES_USER }
if ($env:PGUSER) { $PGUSER = $env:PGUSER }
if ($env:POSTGRES_POSTGRES_DATABASE) { $PGDATABASE = $env:POSTGRES_POSTGRES_DATABASE }
if ($env:PGDATABASE) { $PGDATABASE = $env:PGDATABASE }
if ($env:POSTGRES_POSTGRES_PASSWORD) { $PGPASSWORD = $env:POSTGRES_POSTGRES_PASSWORD }
if ($env:PGPASSWORD) { $PGPASSWORD = $env:PGPASSWORD }

# Set PGPASSWORD if provided
if ($PGPASSWORD) {
    $env:PGPASSWORD = $PGPASSWORD
}

$OUTDIR_BASE = ".\upgrade_run_outputs"
$TS = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$OUTDIR = Join-Path $OUTDIR_BASE "post_upgrade_$TS"

New-Item -ItemType Directory -Path $OUTDIR -Force | Out-Null
Write-Host "Post-upgrade validation outputs will be stored in: $OUTDIR"

$PSQL = "psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -v ON_ERROR_STOP=1 -A -q -t"

Write-Host "Post-upgrade validation starting..."
Write-Host "=================================="

Write-Host "1) Capturing Postgres version..."
"SQL: SELECT version();" | Out-File -FilePath (Join-Path $OUTDIR "01_version.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "01_version.out") -Encoding UTF8
try {
    Invoke-Expression "$PSQL -c `"SELECT version();`"" | Add-Content -Path (Join-Path $OUTDIR "01_version.out") -Encoding UTF8
    Write-Host "✓ Version captured" -ForegroundColor Green
} catch {
    Write-Host "Failed to get version. Check connection." -ForegroundColor Red
    exit 1
}

Write-Host "2) Listing installed extensions (name, version)..."
"SQL: SELECT extname, extversion FROM pg_extension ORDER BY extname;" | Out-File -FilePath (Join-Path $OUTDIR "02_extensions.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "02_extensions.out") -Encoding UTF8
try {
    Invoke-Expression "$PSQL -c `"SELECT extname, extversion FROM pg_extension ORDER BY extname;`"" | Add-Content -Path (Join-Path $OUTDIR "02_extensions.out") -Encoding UTF8
    Write-Host "✓ Extensions listed" -ForegroundColor Green
} catch {
    Write-Host "Failed to list extensions." -ForegroundColor Red
    exit 1
}

Write-Host "3) Listing roles still using md5 password hashing (if any)..."
"SQL: SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';" | Out-File -FilePath (Join-Path $OUTDIR "03_md5_roles.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "03_md5_roles.out") -Encoding UTF8

try {
    Invoke-Expression "$PSQL -c `"SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';`"" 2>$null | Add-Content -Path (Join-Path $OUTDIR "03_md5_roles.out") -Encoding UTF8
    Write-Host "✓ MD5 roles checked" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not query pg_authid (permission denied)" -ForegroundColor Yellow
}

Write-Host "4) Listing replication slots (if using logical replication)..."
"SQL: SELECT * FROM pg_replication_slots;" | Out-File -FilePath (Join-Path $OUTDIR "04_replication_slots.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "04_replication_slots.out") -Encoding UTF8
try {
    Invoke-Expression "$PSQL -c `"SELECT * FROM pg_replication_slots;`"" 2>$null | Add-Content -Path (Join-Path $OUTDIR "04_replication_slots.out") -Encoding UTF8
    Write-Host "✓ Replication slots checked" -ForegroundColor Green
} catch {
    Write-Host "⚠ Could not read pg_replication_slots" -ForegroundColor Yellow
}

Write-Host "5) Generate table counts for public schema (quick health check)..."
"SQL: SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;" | Out-File -FilePath (Join-Path $OUTDIR "05_table_counts.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "05_table_counts.out") -Encoding UTF8
try {
    Invoke-Expression "$PSQL -c `"SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;`"" | Add-Content -Path (Join-Path $OUTDIR "05_table_counts.out") -Encoding UTF8
    Write-Host "✓ Table counts generated" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not get table counts" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "POST-UPGRADE VALIDATION COMPLETE." -ForegroundColor Green
Write-Host "Files saved in: $OUTDIR"
Write-Host ""
Write-Host "Compare these results with your pre-upgrade backup to ensure:"
Write-Host "- PostgreSQL version has been upgraded as expected"
Write-Host "- All extensions are still present and compatible"
Write-Host "- No roles are using deprecated MD5 password hashing"
Write-Host "- Replication slots are still configured correctly"
Write-Host "- Table counts are reasonable (no data loss)"
Write-Host ""
Write-Host "If you notice any issues, investigate before considering the upgrade complete." -ForegroundColor Yellow
