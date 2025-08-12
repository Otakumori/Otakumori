import { NextResponse } from 'next/server';
import { validateEnvironment } from '@/utils/env-validator';
import { validateDatabase } from '@/utils/database-validator';

export async function GET() {
  try {
    // Validate environment variables
    const envValidation = validateEnvironment();
    
    // Validate database connections
    const dbValidation = await validateDatabase();
    
    // Calculate production readiness score
    const productionScore = calculateProductionScore(envValidation, dbValidation);
    
    // Get production status
    const productionStatus = getProductionStatus(envValidation, dbValidation);
    
    // Generate production checklist
    const productionChecklist = generateProductionChecklist(envValidation, dbValidation);
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      production: {
        score: productionScore,
        status: productionStatus,
        checklist: productionChecklist,
      },
      environment: envValidation,
      database: dbValidation,
      recommendations: generateRecommendations(envValidation, dbValidation),
    });
  } catch (error) {
    console.error('System check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

function calculateProductionScore(envValidation: any, dbValidation: any): number {
  let score = 100;
  
  // Environment variables (40% of score)
  const envScore = (envValidation.required.present / envValidation.required.total) * 40;
  score = score - 40 + envScore;
  
  // Database connections (30% of score)
  const dbScore = (dbValidation.connections.working / dbValidation.connections.total) * 30;
  score = score - 30 + dbScore;
  
  // API integrations (20% of score)
  const apiScore = (dbValidation.integrations.working / dbValidation.integrations.total) * 20;
  score = score - 20 + apiScore;
  
  // Table structure (10% of score)
  const tableScore = Object.values(dbValidation.tables).every((t: any) => t.exists) ? 10 : 0;
  score = score - 10 + tableScore;
  
  return Math.max(0, Math.min(100, score));
}

function getProductionStatus(envValidation: any, dbValidation: any): string {
  const score = calculateProductionScore(envValidation, dbValidation);
  
  if (score >= 90) return 'production-ready';
  if (score >= 70) return 'mostly-ready';
  if (score >= 50) return 'needs-work';
  return 'not-ready';
}

function generateProductionChecklist(envValidation: any, dbValidation: any): Record<string, boolean> {
  return {
    environment_configured: envValidation.required.present === envValidation.required.total,
    database_connected: dbValidation.connections.working === dbValidation.connections.total,
    integrations_working: dbValidation.integrations.working === dbValidation.integrations.total,
    tables_exist: Object.values(dbValidation.tables).every((t: any) => t.exists),
    webhooks_configured: envValidation.recommended.present >= 3,
    security_headers: envValidation.recommended.present >= 5,
  };
}

function generateRecommendations(envValidation: any, dbValidation: any): string[] {
  const recommendations: string[] = [];
  
  // Environment recommendations
  if (envValidation.required.missing.length > 0) {
    recommendations.push(`Set required environment variables: ${envValidation.required.missing.join(', ')}`);
  }
  
  if (envValidation.recommended.missing.length > 0) {
    recommendations.push(`Consider setting recommended environment variables: ${envValidation.recommended.missing.join(', ')}`);
  }
  
  // Database recommendations
  if (dbValidation.connections.working < dbValidation.connections.total) {
    recommendations.push('Fix database connection issues');
  }
  
  if (dbValidation.integrations.working < dbValidation.integrations.total) {
    recommendations.push('Fix API integration issues');
  }
  
  // Table recommendations
  const missingTables = Object.entries(dbValidation.tables)
    .filter(([_, t]: [string, any]) => !t.exists)
    .map(([name, _]: [string, any]) => name);
  
  if (missingTables.length > 0) {
    recommendations.push(`Create missing database tables: ${missingTables.join(', ')}`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Your system is production-ready! 🎉');
  }
  
  return recommendations;
}
