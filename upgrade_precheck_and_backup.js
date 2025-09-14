#!/usr/bin/env node

/**
 * PostgreSQL Pre-Upgrade Backup Script (Node.js version)
 * Uses Prisma to connect to your database
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Create output directory
const OUTDIR_BASE = './upgrade_run_outputs';
const TS = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + 'Z';
const OUTDIR = path.join(OUTDIR_BASE, TS);

if (!fs.existsSync(OUTDIR)) {
  fs.mkdirSync(OUTDIR, { recursive: true });
}

console.log(`Outputs will be stored in: ${OUTDIR}`);

// Initialize Prisma client
const prisma = new PrismaClient();

async function runQuery(query, filename) {
  try {
    console.log(`Running: ${filename}`);
    
    // Save the SQL query
    fs.writeFileSync(path.join(OUTDIR, `${filename}.sql`), query);
    
    // Execute the query
    const result = await prisma.$queryRawUnsafe(query);
    
    // Save the result
    const output = `---- OUTPUT ----\n${JSON.stringify(result, null, 2)}`;
    fs.writeFileSync(path.join(OUTDIR, `${filename}.out`), output);
    
    console.log(`✓ Saved ${filename}.out`);
    return result;
  } catch (error) {
    console.log(`⚠ Error running ${filename}: ${error.message}`);
    const output = `---- ERROR ----\n${error.message}`;
    fs.writeFileSync(path.join(OUTDIR, `${filename}.out`), output);
    return null;
  }
}

async function main() {
  try {
    console.log('PostgreSQL Pre-Upgrade Backup Starting...');
    console.log('==========================================');

    // 1. Get PostgreSQL version
    await runQuery('SELECT version();', '01_version');

    // 2. List installed extensions
    await runQuery('SELECT extname, extversion FROM pg_extension ORDER BY extname;', '02_extensions');

    // 3. Check for MD5 password hashing (may fail due to permissions)
    await runQuery('SELECT rolname FROM pg_authid WHERE rolcanlogin = true AND rolpassword LIKE \'md5%\';', '03_md5_roles');

    // 4. List replication slots
    await runQuery('SELECT * FROM pg_replication_slots;', '04_replication_slots');

    // 5. Get table counts
    await runQuery('SELECT schemaname, relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 50;', '05_table_counts');

    // 6. Create database backup using pg_dump (if available)
    console.log('\n6) Creating database backup...');
    console.log('Note: This requires pg_dump to be installed.');
    console.log('If pg_dump is not available, the backup will be skipped.');
    
    try {
      const dumpFile = path.join(OUTDIR, 'backup_dump.sql');
      const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
      
      if (dbUrl) {
        // Try to use pg_dump if available
        try {
          execSync(`pg_dump "${dbUrl}" --clean --if-exists --quote-all-identifiers --no-owner --no-privileges > "${dumpFile}"`, { stdio: 'pipe' });
          console.log(`✓ Database backup created: ${dumpFile}`);
        } catch (pgDumpError) {
          console.log('⚠ pg_dump not available, skipping database backup');
          console.log('  Install PostgreSQL client tools to enable database backup');
        }
      } else {
        console.log('⚠ No DATABASE_URL found, skipping database backup');
      }
    } catch (error) {
      console.log(`⚠ Error creating backup: ${error.message}`);
    }

    console.log('\n==========================================');
    console.log('NON-DESTRUCTIVE PRE-UPGRADE STEPS COMPLETE.');
    console.log(`Files saved in: ${OUTDIR}`);
    console.log('\nNEXT STEPS:');
    console.log('1) Create a Supabase snapshot via Dashboard');
    console.log('2) Perform the database upgrade');
    console.log('3) Run post-upgrade validation');
    console.log('\nScript finished successfully.');

  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
