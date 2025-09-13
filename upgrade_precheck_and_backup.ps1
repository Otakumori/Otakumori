#-------------------------
# Pre-upgrade non-destructive runbook script (PowerShell)
#-------------------------
# Usage:
# Edit connection variables below or set as environment variables.
# Then run: .\upgrade_precheck_and_backup.ps1
#
# This script performs ONLY non-destructive operations:
# - capture Postgres version
# - list installed extensions
# - list roles using md5 passwords
# - list replication slots
# - create a timestamped pg_dump logical backup (read-only)
# - save all outputs to .\upgrade_run_outputs\<timestamp>\
#
# Do NOT run this script from untrusted environments. Keep backups secure.

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
$OUTDIR = Join-Path $OUTDIR_BASE $TS

New-Item -ItemType Directory -Path $OUTDIR -Force | Out-Null
Write-Host "Outputs will be stored in: $OUTDIR"

$PSQL = "psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -v ON_ERROR_STOP=1 -A -q -t"

Write-Host "1) Capturing Postgres version..."
"SQL: SELECT version();" | Out-File -FilePath (Join-Path $OUTDIR "01_version.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "01_version.out") -Encoding UTF8
try {
    Invoke-Expression "$PSQL -c `"SELECT version();`"" | Add-Content -Path (Join-Path $OUTDIR "01_version.out") -Encoding UTF8
    Write-Host "Saved version to $(Join-Path $OUTDIR '01_version.out')"
} catch {
    Write-Host "Failed to get version. Check connection." -ForegroundColor Red
    exit 1
}

Write-Host "2) Listing installed extensions (name, version)..."
"SQL: SELECT extname, extversion FROM pg_extension ORDER BY extname;" | Out-File -FilePath (Join-Path $OUTDIR "02_extensions.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "02_extensions.out") -Encoding UTF8
try {
    Invoke-Expression "$PSQL -c `"SELECT extname, extversion FROM pg_extension ORDER BY extname;`"" | Add-Content -Path (Join-Path $OUTDIR "02_extensions.out") -Encoding UTF8
    Write-Host "Saved extensions list to $(Join-Path $OUTDIR '02_extensions.out')"
} catch {
    Write-Host "Failed to list extensions." -ForegroundColor Red
    exit 1
}

Write-Host "3) Listing roles still using md5 password hashing (if any)..."
"SQL: SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';" | Out-File -FilePath (Join-Path $OUTDIR "03_md5_roles.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "03_md5_roles.out") -Encoding UTF8

try {
    Invoke-Expression "$PSQL -c `"SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';`"" 2>$null | Add-Content -Path (Join-Path $OUTDIR "03_md5_roles.out") -Encoding UTF8
    Write-Host "Saved md5 role check to $(Join-Path $OUTDIR '03_md5_roles.out')"
} catch {
    Write-Host "Note: Could not query pg_authid (permission denied). If so, run the following in a session with superuser access:"
    Write-Host " SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';"
    Write-Host "(Saved partial output to $(Join-Path $OUTDIR '03_md5_roles.out') if any.)"
}

Write-Host "4) Listing replication slots (if using logical replication)..."
"SQL: SELECT * FROM pg_replication_slots;" | Out-File -FilePath (Join-Path $OUTDIR "04_replication_slots.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "04_replication_slots.out") -Encoding UTF8
try {
    Invoke-Expression "$PSQL -c `"SELECT * FROM pg_replication_slots;`"" 2>$null | Add-Content -Path (Join-Path $OUTDIR "04_replication_slots.out") -Encoding UTF8
    Write-Host "Saved replication slots to $(Join-Path $OUTDIR '04_replication_slots.out')"
} catch {
    Write-Host "Could not read pg_replication_slots (permission or none). Check replication configuration manually if you use logical replication."
}

Write-Host "5) Generate table counts for public schema (quick health check)..."
"SQL: SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;" | Out-File -FilePath (Join-Path $OUTDIR "05_table_counts.sql") -Encoding UTF8
"---- OUTPUT ----" | Out-File -FilePath (Join-Path $OUTDIR "05_table_counts.out") -Encoding UTF8
try {
    Invoke-Expression "$PSQL -c `"SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;`"" | Add-Content -Path (Join-Path $OUTDIR "05_table_counts.out") -Encoding UTF8
    Write-Host "Saved table counts to $(Join-Path $OUTDIR '05_table_counts.out')"
} catch {
    Write-Host "Warning: Could not get table counts" -ForegroundColor Yellow
}

# Confirm snapshot creation via Dashboard is required
Write-Host ""
Write-Host "IMPORTANT: Create a managed Supabase snapshot now via the Dashboard (preferred)." -ForegroundColor Yellow
Write-Host " - Supabase Studio → Settings → Backups → Create snapshot"
Write-Host "Press ENTER once the snapshot creation is complete, or type 'skip' to continue without waiting."
$SNAP_ACK = Read-Host
if ($SNAP_ACK -eq "skip") {
    Write-Host "Continuing without explicit snapshot confirmation. Ensure you created a snapshot in the Dashboard before proceeding!" -ForegroundColor Yellow
} else {
    Write-Host "Continuing after snapshot confirmation."
}

Write-Host "6) Creating logical pg_dump backup (read-only). This may take time depending on DB size."
$DUMP_FILE = Join-Path $OUTDIR "backup_dump.sql"
Write-Host "pg_dump command will write to: $DUMP_FILE"
Write-Host "Press ENTER to start pg_dump, or Ctrl-C to cancel."
Read-Host

# Run pg_dump. Uses environment PGPASSWORD or .pgpass for password if needed.
try {
    pg_dump --clean --if-exists --quote-all-identifiers -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE --no-owner --no-privileges | Out-File -FilePath $DUMP_FILE -Encoding UTF8
    Write-Host "pg_dump completed and saved to $DUMP_FILE"
    Get-Item $DUMP_FILE | Select-Object Name, Length, LastWriteTime
} catch {
    Write-Host "pg_dump failed. Check connection and permissions." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "NON-DESTRUCTIVE PRE-UPGRADE STEPS COMPLETE." -ForegroundColor Green
Write-Host "Files saved in: $OUTDIR"
Write-Host ""
Write-Host "NEXT STEPS (manual / Dashboard):"
Write-Host "1) Verify the outputs in $OUTDIR and upload to your incident ticket or store securely."
Write-Host "2) If applicable, prune pg_cron.job_run_details BEFORE upgrade to avoid disk pressure (OPTIONAL and DESTRUCTIVE). DO NOT RUN here."
Write-Host " - If you intend to prune, test in staging and ensure backups are taken."
Write-Host "3) Perform a staging upgrade (restore snapshot to a staging project) and run integration tests."
Write-Host "4) Schedule maintenance window and perform 'Upgrade project' from Supabase Dashboard (in-place) or Pause & Restore as required."
Write-Host ""
Write-Host "POST-UPGRADE VALIDATION QUERIES (run after upgrade completes):"
Write-Host " - SELECT version();"
Write-Host " - SELECT extname, extversion FROM pg_extension ORDER BY extname;"
Write-Host " - SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';"
Write-Host " - SELECT * FROM pg_replication_slots;"
Write-Host ""
Write-Host "If you need, I can produce a separate script that runs these post-upgrade checks automatically once you confirm the upgrade is complete."
Write-Host ""
Write-Host "Script finished successfully." -ForegroundColor Green
