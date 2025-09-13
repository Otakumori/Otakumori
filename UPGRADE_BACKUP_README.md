# PostgreSQL Pre-Upgrade Backup Scripts

This directory contains scripts to safely backup your PostgreSQL database before performing an upgrade. The scripts perform **ONLY non-destructive operations** to ensure your data remains safe.

## Files Included

- `upgrade_precheck_and_backup.sh` - Bash script for Linux/Mac/WSL
- `upgrade_precheck_and_backup.ps1` - PowerShell script for Windows
- `upgrade_config.env.example` - Configuration template
- `UPGRADE_BACKUP_README.md` - This documentation

## What the Scripts Do

The scripts perform the following **non-destructive** operations:

1. **Capture PostgreSQL version** - Records current database version
2. **List installed extensions** - Documents all extensions and their versions
3. **Check for MD5 password hashing** - Identifies roles using deprecated MD5 hashing
4. **List replication slots** - Documents any logical replication configuration
5. **Generate table statistics** - Quick health check with table row counts
6. **Create logical backup** - Full pg_dump backup of your database
7. **Save all outputs** - Timestamped directory with all collected information

## Prerequisites

- PostgreSQL client tools (`psql`, `pg_dump`) installed
- Database connection details
- Appropriate permissions to read from your database

## Quick Start

### Option 1: Using Configuration File

1. Copy the configuration template:

   ```bash
   cp upgrade_config.env.example upgrade_config.env
   ```

2. Edit `upgrade_config.env` with your database details:

   ```bash
   PGHOST=db.your-project-ref.supabase.co
   PGPORT=5432
   PGUSER=postgres
   PGDATABASE=postgres
   PGPASSWORD=your-database-password
   ```

3. Source the configuration and run the script:

   ```bash
   # Linux/Mac/WSL
   source upgrade_config.env
   ./upgrade_precheck_and_backup.sh
   
   # Windows PowerShell
   . .\upgrade_config.env
   .\upgrade_precheck_and_backup.ps1
   ```

### Option 2: Using Environment Variables

Set environment variables directly:

```bash
# Linux/Mac/WSL
export PGHOST=db.your-project-ref.supabase.co
export PGPORT=5432
export PGUSER=postgres
export PGDATABASE=postgres
export PGPASSWORD=your-database-password
./upgrade_precheck_and_backup.sh

# Windows PowerShell
$env:PGHOST="db.your-project-ref.supabase.co"
$env:PGPORT="5432"
$env:PGUSER="postgres"
$env:PGDATABASE="postgres"
$env:PGPASSWORD="your-database-password"
.\upgrade_precheck_and_backup.ps1
```

### Option 3: Using .pgpass File (Recommended for Security)

Create a `.pgpass` file in your home directory:

```bash
# Format: hostname:port:database:username:password
db.your-project-ref.supabase.co:5432:postgres:postgres:your-password
```

Set appropriate permissions:

```bash
chmod 600 ~/.pgpass
```

Then run the script without setting PGPASSWORD:

```bash
./upgrade_precheck_and_backup.sh
```

## For Supabase Users

If you're using Supabase, get your connection details from:

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the connection details from the "Connection string" section

Example Supabase connection:

```bash
PGHOST=db.abcdefghijklmnop.supabase.co
PGPORT=5432
PGUSER=postgres
PGDATABASE=postgres
PGPASSWORD=your-database-password
```

## Output

The script creates a timestamped directory with all collected information:

```text
upgrade_run_outputs/
└── 20241201T143022Z/
    ├── 01_version.sql
    ├── 01_version.out
    ├── 02_extensions.sql
    ├── 02_extensions.out
    ├── 03_md5_roles.sql
    ├── 03_md5_roles.out
    ├── 04_replication_slots.sql
    ├── 04_replication_slots.out
    ├── 05_table_counts.sql
    ├── 05_table_counts.out
    └── backup_dump.sql
```

## Important Notes

### Before Running

1. **Create a Supabase snapshot** via the Dashboard (recommended)
   - Go to Supabase Studio → Settings → Backups → Create snapshot
   - This provides an additional safety net

2. **Test in staging first** if possible
   - Restore your snapshot to a staging project
   - Run integration tests to verify everything works

### During the Script

- The script will pause for you to confirm snapshot creation
- It will ask for confirmation before running pg_dump (which may take time)
- All operations are read-only and non-destructive

### After Running

1. **Verify the outputs** in the timestamped directory
2. **Store backups securely** - upload to your incident ticket or secure storage
3. **Review the collected information** before proceeding with upgrade

## Next Steps

After running the backup script:

1. **Schedule maintenance window** for the upgrade
2. **Perform the upgrade** via Supabase Dashboard or your preferred method
3. **Run post-upgrade validation** (queries provided in script output)
4. **Test your application** thoroughly after upgrade

## Troubleshooting

### Connection Issues

- Verify your database connection details
- Check if your IP is whitelisted (for cloud databases)
- Ensure PostgreSQL client tools are installed

### Permission Issues

- Some queries require superuser access
- The script will note which queries failed due to permissions
- Run those queries manually with appropriate permissions if needed

### Large Database

- pg_dump may take significant time for large databases
- Consider running during off-peak hours
- Monitor disk space for the backup file

## Security

- Never commit database passwords to version control
- Use `.pgpass` file for secure password storage
- Store backup files securely
- Delete temporary files after successful upgrade

## Support

If you encounter issues:

1. Check the error messages in the output files
2. Verify your database connection independently
3. Review the PostgreSQL documentation for your specific version
4. Contact your database administrator if needed

## Post-Upgrade Validation

After completing your upgrade, run these queries to verify everything is working:

```sql
-- Check PostgreSQL version
SELECT version();

-- Check extensions
SELECT extname, extversion FROM pg_extension ORDER BY extname;

-- Check for MD5 roles (should be empty after upgrade)
SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE 'md5%';

-- Check replication slots
SELECT * FROM pg_replication_slots;
```

Compare these results with your pre-upgrade backup to ensure everything is as expected.
