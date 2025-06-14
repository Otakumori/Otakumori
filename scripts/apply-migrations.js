const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath, 'utf8'));

// Set environment variables
Object.keys(envConfig).forEach(key => {
  process.env[key] = envConfig[key];
});

// Debug logging
console.log('Environment variables loaded:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('POSTGRES_SUPABASE_SERVICE_ROLE_KEY:', process.env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY ? '***' : 'undefined');

// Validate environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  POSTGRES_SUPABASE_SERVICE_ROLE_KEY: process.env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.POSTGRES_SUPABASE_SERVICE_ROLE_KEY
);

async function executeSql(sql) {
  try {
    // Use the SQL API to execute SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

async function applyMigrations() {
  try {
    console.log('Starting migration process...');

    // Read migrations directory
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
    const files = await fs.promises.readdir(migrationsDir);
    
    // Sort files by name (which includes timestamp)
    const migrationFiles = files
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Apply each migration
    for (const file of migrationFiles) {
      console.log(`Applying migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.promises.readFile(filePath, 'utf8');

      // Normalize line endings to Unix style
      const normalizedSql = sql.replace(/\r\n/g, '\n');
      // Split SQL into individual statements
      const statements = normalizedSql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);

      // Execute each statement
      for (const statement of statements) {
        if (statement.length > 0) {
          await executeSql(statement);
        }
      }

      console.log(`Successfully applied migration: ${file}`);
    }

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
  .catch(error => {
    console.error('Migration process failed:', error);
    process.exit(1);
  }); 