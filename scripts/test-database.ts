#!/usr/bin/env tsx

/**
 * Database Connection Test Script
 * Tests database connectivity and common operations
 */

import { db } from '@/lib/db';

async function testDatabase() {
  console.log('⌕ Testing Database Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    await db.$connect();
    console.log(' Database connection successful\n');

    // Test 2: Simple query
    console.log('2. Testing simple query...');
    const userCount = await db.user.count();
    console.log(` User count query successful: ${userCount} users\n`);

    // Test 3: Content page query
    console.log('3. Testing content page query...');
    const contentCount = await db.contentPage.count();
    console.log(` Content page count query successful: ${contentCount} pages\n`);

    // Test 4: Leaderboard query
    console.log('4. Testing leaderboard query...');
    const leaderboardCount = await db.leaderboardScore.count();
    console.log(` Leaderboard count query successful: ${leaderboardCount} scores\n`);

    // Test 5: Soapstone query
    console.log('5. Testing soapstone query...');
    const soapstoneCount = await db.soapstoneMessage.count();
    console.log(` Soapstone count query successful: ${soapstoneCount} messages\n`);

    console.log(' All database tests passed!');
  } catch (error) {
    console.error(' Database test failed:', error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Check common issues
    console.log('\n⌕ Common Database Issues:');
    console.log('1. Check DATABASE_URL in environment');
    console.log('2. Verify Supabase connection string');
    console.log('3. Check network connectivity');
    console.log('4. Verify database permissions');
  } finally {
    await db.$disconnect();
    console.log('\n Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testDatabase().catch(console.error);
}

export { testDatabase };
