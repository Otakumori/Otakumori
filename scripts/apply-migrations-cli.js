const { execSync } = require('child_process');
const path = require('path');

async function applyMigrations() {
  try {
    console.log('Starting migration process using Supabase CLI...');

    // Get the migrations directory path
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

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
