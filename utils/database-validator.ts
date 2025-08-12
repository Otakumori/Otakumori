import { supabase } from '@/utils/supabase/client';

export interface DatabaseValidationResult {
  isValid: boolean;
  tables: Record<string, { exists: boolean; columns?: string[]; error?: string }>;
  connections: {
    supabase: boolean;
    printify: boolean;
  };
  recommendations: string[];
}

export async function validateDatabase(): Promise<DatabaseValidationResult> {
  const result: DatabaseValidationResult = {
    isValid: true,
    tables: {},
    connections: {
      supabase: false,
      printify: false,
    },
    recommendations: [],
  };

  try {
    // Test Supabase connection
    const { data: supabaseTest, error: supabaseError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (supabaseError) {
      result.connections.supabase = false;
      result.recommendations.push('Supabase connection failed. Check your credentials and network.');
    } else {
      result.connections.supabase = true;
    }

    // Check required tables
    const requiredTables = [
      'products',
      'orders',
      'users',
      'cart_items',
      'categories',
      'reviews',
      'achievements',
      'user_achievements',
    ];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          result.tables[tableName] = { exists: false, error: error.message };
          result.isValid = false;
          result.recommendations.push(`Table '${tableName}' does not exist or is not accessible.`);
        } else {
          result.tables[tableName] = { exists: true, columns: [] };
        }
      } catch (error) {
        result.tables[tableName] = { 
          exists: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        result.isValid = false;
        result.recommendations.push(`Failed to access table '${tableName}'.`);
      }
    }

    // Check specific table schemas
    if (result.tables.products?.exists) {
      try {
        const { data: columns, error } = await supabase
          .rpc('get_table_columns', { table_name: 'products' });

        if (!error && columns) {
          result.tables.products.columns = columns;
        }
      } catch (error) {
        // Fallback: try to describe the table structure
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(0);

          if (!error) {
            // This will give us the column names from the response headers
            result.tables.products.columns = Object.keys(data || {});
          }
        } catch (fallbackError) {
          console.warn('Could not determine products table structure:', fallbackError);
        }
      }
    }

    // Check Printify connection if credentials are available
    try {
      const response = await fetch('/api/shop/test-connection');
      if (response.ok) {
        const data = await response.json();
        result.connections.printify = data.status === 'connected';
      } else {
        result.connections.printify = false;
        result.recommendations.push('Printify connection failed. Check your API credentials.');
      }
    } catch (error) {
      result.connections.printify = false;
      result.recommendations.push('Could not test Printify connection.');
    }

    // Generate recommendations based on findings
    if (!result.connections.supabase) {
      result.recommendations.push('Fix Supabase connection to enable database functionality.');
    }

    if (!result.connections.printify) {
      result.recommendations.push('Configure Printify integration for product management.');
    }

    const missingTables = Object.entries(result.tables)
      .filter(([_, info]) => !info.exists)
      .map(([name]) => name);

    if (missingTables.length > 0) {
      result.recommendations.push(`Create missing tables: ${missingTables.join(', ')}`);
    }

    // Check for essential columns in products table
    if (result.tables.products?.exists && result.tables.products.columns) {
      const essentialColumns = ['id', 'title', 'price', 'description'];
      const missingColumns = essentialColumns.filter(col => 
        !result.tables.products.columns!.includes(col)
      );

      if (missingColumns.length > 0) {
        result.recommendations.push(`Add missing columns to products table: ${missingColumns.join(', ')}`);
      }
    }

  } catch (error) {
    result.isValid = false;
    result.recommendations.push(`Database validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

export function logDatabaseStatus(validation: DatabaseValidationResult): void {
  console.log('\n🗄️  Database Validation Report');
  console.log('================================');
  
  console.log(`\n🔌 Connections:`);
  console.log(`   Supabase: ${validation.connections.supabase ? '✅ Connected' : '❌ Failed'}`);
  console.log(`   Printify: ${validation.connections.printify ? '✅ Connected' : '❌ Failed'}`);
  
  console.log(`\n📊 Tables:`);
  Object.entries(validation.tables).forEach(([tableName, info]) => {
    const status = info.exists ? '✅' : '❌';
    const details = info.error ? ` (${info.error})` : info.columns ? ` (${info.columns.length} columns)` : '';
    console.log(`   ${status} ${tableName}${details}`);
  });
  
  if (validation.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    validation.recommendations.forEach(rec => {
      console.log(`   - ${rec}`);
    });
  }
  
  console.log(`\nOverall Status: ${validation.isValid ? '✅ Valid' : '❌ Issues Found'}\n`);
}
