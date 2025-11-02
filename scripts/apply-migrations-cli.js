const { execSync } = require('child_process');
const path = require('path');

const scriptPath = path.relative(process.cwd(), __filename);

async function applyMigrations() {
  try {
    console.log(`Starting migration process using Supabase CLI (${scriptPath})...`);

    // Run the Supabase migration command
    const command = `supabase db push`;
    console.log(`Executing command: ${command}`);

    execSync(command, { stdio: 'inherit' });

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
applyMigrations()
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
