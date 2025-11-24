#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function testAPI() {
  try {
    // Simulate the API call
    const { GET } = await import('@/app/api/v1/printify/search/route');
    const request = new Request('http://localhost:3000/api/v1/printify/search?limit=20');
    const response = await GET(request as any);
    const data = await response.json();

    console.log('\n📊 API Response:\n');
    console.log(`Total products returned: ${data.data?.products?.length || 0}`);
    console.log(`Total count: ${data.data?.pagination?.total || 0}\n`);

    if (data.data?.products) {
      console.log('Products returned:\n');
      data.data.products.forEach((p: any, i: number) => {
        console.log(`${i + 1}. ${p.title || p.name || 'Unnamed'}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Printify ID: ${p.printifyProductId || p.integrationRef || 'N/A'}\n`);
      });
    } else {
      console.log('No products in response');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();

