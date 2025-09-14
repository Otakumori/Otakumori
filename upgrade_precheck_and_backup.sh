#!/bin/bash

#-------------------------
# Pre-upgrade non-destructive runbook script
#-------------------------
# Usage:
# Edit connection variables below or export PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE beforehand.
# Then run: ./upgrade_precheck_and_backup.sh
#
# This script performs ONLY non-destructive operations:
# - capture Postgres version
# - list installed extensions
# - list roles using md5 passwords
# - list replication slots
# - create a timestamped pg_dump logical backup (read-only)
# - save all outputs to ./upgrade_run_outputs/<timestamp>/
#
# Do NOT run this script from untrusted environments. Keep backups secure.

# Connection config: edit below or set as environment variables
PGHOST="${PGHOST:-your-db-host}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-postgres}"

# PGPASSWORD should be provided in environment for non-interactive runs:
# export PGPASSWORD='...'
# NOTE: For security, prefer to run interactively or use a .pgpass file.

OUTDIR_BASE="./upgrade_run_outputs"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUTDIR="${OUTDIR_BASE}/${TS}"

mkdir -p "${OUTDIR}"
echo "Outputs will be stored in: ${OUTDIR}"

PSQL="psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d ${PGDATABASE} -v ON_ERROR_STOP=1 -A -q -t"

echo "1) Capturing Postgres version..."
echo "SQL: SELECT version();" > "${OUTDIR}/01_version.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/01_version.out"
${PSQL} -c "SELECT version();" >> "${OUTDIR}/01_version.out" || { echo "Failed to get version. Check connection."; exit 1; }
echo "Saved version to ${OUTDIR}/01_version.out"

echo "2) Listing installed extensions (name, version)..."
echo "SQL: SELECT extname, extversion FROM pg_extension ORDER BY extname;" > "${OUTDIR}/02_extensions.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/02_extensions.out"
${PSQL} -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;" >> "${OUTDIR}/02_extensions.out" || { echo "Failed to list extensions."; exit 1; }
echo "Saved extensions list to ${OUTDIR}/02_extensions.out"

echo "3) Listing roles still using md5 password hashing (if any)..."
echo "SQL: SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';" > "${OUTDIR}/03_md5_roles.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/03_md5_roles.out"

# This query requires direct superuser access; if your connection lacks permission, it may fail.
if ${PSQL} -c "SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';" >> "${OUTDIR}/03_md5_roles.out" 2>/dev/null; then
    echo "Saved md5 role check to ${OUTDIR}/03_md5_roles.out"
else
    echo "Note: Could not query pg_authid (permission denied). If so, run the following in a session with superuser access:"
    echo " SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';"
    echo "(Saved partial output to ${OUTDIR}/03_md5_roles.out if any.)"
fi

echo "4) Listing replication slots (if using logical replication)..."
echo "SQL: SELECT * FROM pg_replication_slots;" > "${OUTDIR}/04_replication_slots.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/04_replication_slots.out"
if ${PSQL} -c "SELECT * FROM pg_replication_slots;" >> "${OUTDIR}/04_replication_slots.out" 2>/dev/null; then
    echo "Saved replication slots to ${OUTDIR}/04_replication_slots.out"
else
    echo "Could not read pg_replication_slots (permission or none). Check replication configuration manually if you use logical replication."
fi

echo "5) Generate table counts for public schema (quick health check)..."
echo "SQL: SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;" > "${OUTDIR}/05_table_counts.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/05_table_counts.out"
${PSQL} -c "SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;" >> "${OUTDIR}/05_table_counts.out" || true
echo "Saved table counts to ${OUTDIR}/05_table_counts.out"

# Confirm snapshot creation via Dashboard is required
echo
echo "IMPORTANT: Create a managed Supabase snapshot now via the Dashboard (preferred)."
echo " - Supabase Studio → Settings → Backups → Create snapshot"
echo "Press ENTER once the snapshot creation is complete, or type 'skip' to continue without waiting."
read -r SNAP_ACK
if [ "${SNAP_ACK}" = "skip" ]; then
    echo "Continuing without explicit snapshot confirmation. Ensure you created a snapshot in the Dashboard before proceeding!"
else
    echo "Continuing after snapshot confirmation."
fi

echo "6) Creating logical pg_dump backup (read-only). This may take time depending on DB size."
DUMP_FILE="${OUTDIR}/backup_dump.sql"
echo "pg_dump command will write to: ${DUMP_FILE}"
echo "Press ENTER to start pg_dump, or Ctrl-C to cancel."
read -r _

# Run pg_dump. Uses environment PGPASSWORD or .pgpass for password if needed.
pg_dump --clean --if-exists --quote-all-identifiers -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" --no-owner --no-privileges > "${DUMP_FILE}"
echo "pg_dump completed and saved to ${DUMP_FILE}"
ls -lh "${DUMP_FILE}" || true

echo
echo "NON-DESTRUCTIVE PRE-UPGRADE STEPS COMPLETE."
echo "Files saved in: ${OUTDIR}"
echo
echo "NEXT STEPS (manual / Dashboard):"
echo "1) Verify the outputs in ${OUTDIR} and upload to your incident ticket or store securely."
echo "2) If applicable, prune pg_cron.job_run_details BEFORE upgrade to avoid disk pressure (OPTIONAL and DESTRUCTIVE). DO NOT RUN here."
echo " - If you intend to prune, test in staging and ensure backups are taken."
echo "3) Perform a staging upgrade (restore snapshot to a staging project) and run integration tests."
echo "4) Schedule maintenance window and perform 'Upgrade project' from Supabase Dashboard (in-place) or Pause & Restore as required."
echo
echo "POST-UPGRADE VALIDATION QUERIES (run after upgrade completes):"
echo " - SELECT version();"
echo " - SELECT extname, extversion FROM pg_extension ORDER BY extname;"
echo " - SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';"
echo " - SELECT * FROM pg_replication_slots;"
echo
echo "If you need, I can produce a separate script that runs these post-upgrade checks automatically once you confirm the upgrade is complete."
echo
echo "Script finished successfully."
