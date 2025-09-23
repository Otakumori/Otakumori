#!/usr/bin/env tsx

/**
 * Database Stress Testing for High-Volume Transactions
 * Tests Praise, Wishlist, Signs, and Trades under stress
 *
 * Usage: npm run stress-test:db
 */

import { PrismaClient } from '@prisma/client';
import { performance } from 'perf_hooks';

const db = new PrismaClient();

interface StressTestResult {
  operation: string;
  totalOperations: number;
  successCount: number;
  errorCount: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number; // ops/sec
}

class DatabaseStressTester {
  private results: StressTestResult[] = [];

  async runAllTests() {
    console.log('🔥 Starting Database Stress Tests...\n');

    // Test scenarios
    await this.testPraiseVolume();
    await this.testWishlistToggling();
    await this.testSoapstoneMessages();
    await this.testTradeOffers();
    await this.testIdempotencyKeys();

    // Summary
    this.printSummary();
    await db.$disconnect();
  }

  private async testPraiseVolume() {
    console.log('📊 Testing Praise Volume (Daily Limits)...');

    const users = await this.createTestUsers(100);
    const latencies: number[] = [];
    let successCount = 0;
    let errorCount = 0;

    const startTime = performance.now();

    // Simulate 1000 praise transactions with proper constraints
    const operations = Array.from({ length: 1000 }, (_, i) => async () => {
      const start = performance.now();
      try {
        const senderId = users[i % users.length].id;
        const receiverId = users[(i + 1) % users.length].id;
        const dayKey = '2025-01-15'; // Fixed day for testing

        await db.praise.create({
          data: {
            senderId,
            receiverId,
            dayKey: `${dayKey}-${i}`, // Make unique for stress test
          },
        });

        successCount++;
        latencies.push(performance.now() - start);
      } catch (error) {
        errorCount++;
        // Expected: some will fail due to constraints
      }
    });

    // Run operations in batches for realistic load
    const batchSize = 10;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      await Promise.all(batch.map((op) => op()));
    }

    const totalTime = performance.now() - startTime;
    latencies.sort((a, b) => a - b);

    this.results.push({
      operation: 'Praise Creation',
      totalOperations: 1000,
      successCount,
      errorCount,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)],
      throughput: (successCount / totalTime) * 1000,
    });

    console.log(`  ✅ ${successCount} successful, ${errorCount} failed\n`);
  }

  private async testWishlistToggling() {
    console.log('💖 Testing Wishlist Toggling...');

    const users = await this.createTestUsers(50);
    const products = await this.createTestProducts(20);
    const latencies: number[] = [];
    let successCount = 0;
    let errorCount = 0;

    const startTime = performance.now();

    // Simulate rapid wishlist toggles
    const operations = Array.from({ length: 500 }, (_, i) => async () => {
      const start = performance.now();
      try {
        const userId = users[i % users.length].id;
        const productId = products[i % products.length].id;

        // Try to create, if exists it will fail (unique constraint)
        try {
          await db.wishlist.create({
            data: { userId, productId },
          });
        } catch {
          // If it exists, delete it (toggle off)
          await db.wishlist.delete({
            where: {
              userId_productId: { userId, productId },
            },
          });
        }

        successCount++;
        latencies.push(performance.now() - start);
      } catch (error) {
        errorCount++;
      }
    });

    // Run in parallel batches
    const batchSize = 15;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      await Promise.all(batch.map((op) => op()));
    }

    const totalTime = performance.now() - startTime;
    latencies.sort((a, b) => a - b);

    this.results.push({
      operation: 'Wishlist Toggle',
      totalOperations: 500,
      successCount,
      errorCount,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)],
      throughput: (successCount / totalTime) * 1000,
    });

    console.log(`  ✅ ${successCount} successful, ${errorCount} failed\n`);
  }

  private async testSoapstoneMessages() {
    console.log('🪨 Testing Soapstone Message Creation...');

    const users = await this.createTestUsers(75);
    const latencies: number[] = [];
    let successCount = 0;
    let errorCount = 0;

    const startTime = performance.now();

    const messages = [
      'Praise the sun!',
      'Try finger but hole',
      'Amazing chest ahead',
      'Beware of dog',
      'Hidden wall ahead',
      'Liar ahead',
      'Victory!',
      'Good luck!',
    ];

    const operations = Array.from({ length: 800 }, (_, i) => async () => {
      const start = performance.now();
      try {
        const authorId = users[i % users.length].id;
        const text = messages[i % messages.length] + ` #${i}`;

        await db.soapstoneMessage.create({
          data: {
            authorId,
            text,
            status: 'VISIBLE',
          },
        });

        successCount++;
        latencies.push(performance.now() - start);
      } catch (error) {
        errorCount++;
      }
    });

    // Run in batches
    const batchSize = 20;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      await Promise.all(batch.map((op) => op()));
    }

    const totalTime = performance.now() - startTime;
    latencies.sort((a, b) => a - b);

    this.results.push({
      operation: 'Soapstone Messages',
      totalOperations: 800,
      successCount,
      errorCount,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)],
      throughput: (successCount / totalTime) * 1000,
    });

    console.log(`  ✅ ${successCount} successful, ${errorCount} failed\n`);
  }

  private async testTradeOffers() {
    console.log('🤝 Testing Trade Offers...');

    const users = await this.createTestUsers(30);
    const latencies: number[] = [];
    let successCount = 0;
    let errorCount = 0;

    const startTime = performance.now();

    const operations = Array.from({ length: 200 }, (_, i) => async () => {
      const start = performance.now();
      try {
        const initiatorId = users[i % users.length].id;
        const targetUserId = users[(i + 1) % users.length].id;

        await db.tradeOffer.create({
          data: {
            initiatorId,
            targetUserId: Math.random() > 0.5 ? targetUserId : null, // 50% public trades
            offerType: Math.random() > 0.5 ? 'DIRECT' : 'PUBLIC',
            title: `Trade Offer #${i}`,
            description: `Trading petals for runes #${i}`,
            offerPetals: Math.floor(Math.random() * 100) + 10,
            requestRunes: Math.floor(Math.random() * 5) + 1,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        });

        successCount++;
        latencies.push(performance.now() - start);
      } catch (error) {
        errorCount++;
      }
    });

    // Run in smaller batches for trade complexity
    const batchSize = 5;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      await Promise.all(batch.map((op) => op()));
    }

    const totalTime = performance.now() - startTime;
    latencies.sort((a, b) => a - b);

    this.results.push({
      operation: 'Trade Offers',
      totalOperations: 200,
      successCount,
      errorCount,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)],
      throughput: (successCount / totalTime) * 1000,
    });

    console.log(`  ✅ ${successCount} successful, ${errorCount} failed\n`);
  }

  private async testIdempotencyKeys() {
    console.log('🔑 Testing Idempotency Key Performance...');

    const latencies: number[] = [];
    let successCount = 0;
    let errorCount = 0;

    const startTime = performance.now();

    const operations = Array.from({ length: 1000 }, (_, i) => async () => {
      const start = performance.now();
      try {
        const key = `test-key-${i}-${Date.now()}`;

        await db.idempotencyKey.create({
          data: {
            key,
            method: 'POST',
            path: '/api/test',
            userId: `user-${i % 100}`,
            response: JSON.stringify({ success: true, id: i }),
            purpose: 'stress-test',
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          },
        });

        successCount++;
        latencies.push(performance.now() - start);
      } catch (error) {
        errorCount++;
      }
    });

    // High concurrency for idempotency testing
    const batchSize = 50;
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      await Promise.all(batch.map((op) => op()));
    }

    const totalTime = performance.now() - startTime;
    latencies.sort((a, b) => a - b);

    this.results.push({
      operation: 'Idempotency Keys',
      totalOperations: 1000,
      successCount,
      errorCount,
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95Latency: latencies[Math.floor(latencies.length * 0.95)],
      p99Latency: latencies[Math.floor(latencies.length * 0.99)],
      throughput: (successCount / totalTime) * 1000,
    });

    console.log(`  ✅ ${successCount} successful, ${errorCount} failed\n`);
  }

  private async createTestUsers(count: number) {
    const users = [];
    for (let i = 0; i < count; i++) {
      try {
        const user = await db.user.create({
          data: {
            email: `stress-test-${i}-${Date.now()}@example.com`,
            username: `stress-user-${i}-${Date.now()}`,
            display_name: `Stress User ${i}`,
            clerkId: `stress-clerk-${i}-${Date.now()}`,
          },
        });
        users.push(user);
      } catch {
        // User might already exist, skip
      }
    }
    return users;
  }

  private async createTestProducts(count: number) {
    const products = [];
    for (let i = 0; i < count; i++) {
      try {
        const product = await db.product.create({
          data: {
            id: `stress-product-${i}-${Date.now()}`,
            name: `Stress Test Product ${i}`,
            description: `A product for stress testing purposes ${i}`,
            active: true,
          },
        });
        products.push(product);
      } catch {
        // Product might already exist, skip
      }
    }
    return products;
  }

  private printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE STRESS TEST SUMMARY');
    console.log('='.repeat(80));

    this.results.forEach((result) => {
      console.log(`\n🔍 ${result.operation}:`);
      console.log(`   Operations: ${result.totalOperations}`);
      console.log(
        `   Success Rate: ${((result.successCount / result.totalOperations) * 100).toFixed(1)}%`,
      );
      console.log(`   Avg Latency: ${result.avgLatency.toFixed(2)}ms`);
      console.log(`   P95 Latency: ${result.p95Latency.toFixed(2)}ms`);
      console.log(`   P99 Latency: ${result.p99Latency.toFixed(2)}ms`);
      console.log(`   Throughput: ${result.throughput.toFixed(0)} ops/sec`);

      // Performance evaluation
      if (result.avgLatency > 100) {
        console.log(`   ⚠️  HIGH LATENCY DETECTED`);
      } else if (result.avgLatency < 20) {
        console.log(`   ✅ EXCELLENT PERFORMANCE`);
      } else {
        console.log(`   👍 GOOD PERFORMANCE`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('🎯 RECOMMENDATIONS:');

    const avgLatency = this.results.reduce((sum, r) => sum + r.avgLatency, 0) / this.results.length;
    const totalThroughput = this.results.reduce((sum, r) => sum + r.throughput, 0);

    if (avgLatency > 50) {
      console.log('   • Consider adding more database indexes');
      console.log('   • Review query optimization');
      console.log('   • Consider connection pooling');
    }

    if (totalThroughput < 1000) {
      console.log('   • Consider database scaling (read replicas)');
      console.log('   • Implement caching layer (Redis)');
    } else {
      console.log('   ✅ Database performance is excellent for production');
    }

    console.log('='.repeat(80) + '\n');
  }
}

// Run the stress test
async function main() {
  const tester = new DatabaseStressTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseStressTester };
