#!/bin/bash

#-------------------------
# Post-upgrade validation script
#-------------------------
# Usage: ./post_upgrade_validation.sh
# This script runs the same queries as the pre-upgrade script
# to validate that the upgrade completed successfully.

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
OUTDIR="${OUTDIR_BASE}/post_upgrade_${TS}"

mkdir -p "${OUTDIR}"
echo "Post-upgrade validation outputs will be stored in: ${OUTDIR}"

PSQL="psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d ${PGDATABASE} -v ON_ERROR_STOP=1 -A -q -t"

echo "Post-upgrade validation starting..."
echo "=================================="

echo "1) Capturing Postgres version..."
echo "SQL: SELECT version();" > "${OUTDIR}/01_version.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/01_version.out"
${PSQL} -c "SELECT version();" >> "${OUTDIR}/01_version.out" || { echo "Failed to get version. Check connection."; exit 1; }
echo "✓ Version captured"

echo "2) Listing installed extensions (name, version)..."
echo "SQL: SELECT extname, extversion FROM pg_extension ORDER BY extname;" > "${OUTDIR}/02_extensions.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/02_extensions.out"
${PSQL} -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;" >> "${OUTDIR}/02_extensions.out" || { echo "Failed to list extensions."; exit 1; }
echo "✓ Extensions listed"

echo "3) Listing roles still using md5 password hashing (if any)..."
echo "SQL: SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';" > "${OUTDIR}/03_md5_roles.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/03_md5_roles.out"

if ${PSQL} -c "SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';" >> "${OUTDIR}/03_md5_roles.out" 2>/dev/null; then
    echo "✓ MD5 roles checked"
else
    echo "⚠ Could not query pg_authid (permission denied)"
fi

echo "4) Listing replication slots (if using logical replication)..."
echo "SQL: SELECT * FROM pg_replication_slots;" > "${OUTDIR}/04_replication_slots.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/04_replication_slots.out"
if ${PSQL} -c "SELECT * FROM pg_replication_slots;" >> "${OUTDIR}/04_replication_slots.out" 2>/dev/null; then
    echo "✓ Replication slots checked"
else
    echo "⚠ Could not read pg_replication_slots"
fi

echo "5) Generate table counts for public schema (quick health check)..."
echo "SQL: SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;" > "${OUTDIR}/05_table_counts.sql"
echo "---- OUTPUT ----" > "${OUTDIR}/05_table_counts.out"
${PSQL} -c "SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;" >> "${OUTDIR}/05_table_counts.out" || true
echo "✓ Table counts generated"

echo ""
echo "POST-UPGRADE VALIDATION COMPLETE."
echo "Files saved in: ${OUTDIR}"
echo ""
echo "Compare these results with your pre-upgrade backup to ensure:"
echo "- PostgreSQL version has been upgraded as expected"
echo "- All extensions are still present and compatible"
echo "- No roles are using deprecated MD5 password hashing"
echo "- Replication slots are still configured correctly"
echo "- Table counts are reasonable (no data loss)"
echo ""
echo "If you notice any issues, investigate before considering the upgrade complete."
