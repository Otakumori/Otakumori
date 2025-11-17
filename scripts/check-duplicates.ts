import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate products...\n');

  // Get all products
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      printifyProductId: true,
      integrationRef: true,
      blueprintId: true,
      active: true,
      visible: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Total products in database: ${allProducts.length}\n`);

  // Check for duplicate printifyProductId (should be unique)
  const printifyDuplicates = new Map<string, typeof allProducts>();
  allProducts.forEach((product) => {
    if (product.printifyProductId) {
      if (!printifyDuplicates.has(product.printifyProductId)) {
        printifyDuplicates.set(product.printifyProductId, []);
      }
      printifyDuplicates.get(product.printifyProductId)!.push(product);
    }
  });

  const printifyDupes = Array.from(printifyDuplicates.entries()).filter(
    ([_, products]) => products.length > 1
  );

  if (printifyDupes.length > 0) {
    console.log(`❌ Found ${printifyDupes.length} duplicate printifyProductId(s):`);
    printifyDupes.forEach(([id, products]) => {
      console.log(`\n  printifyProductId: ${id} (${products.length} duplicates)`);
      products.forEach((p) => {
        console.log(
          `    - ${p.name} (id: ${p.id}, active: ${p.active}, visible: ${p.visible}, created: ${p.createdAt.toISOString()})`
        );
      });
    });
    console.log('');
  } else {
    console.log('✅ No duplicate printifyProductId found\n');
  }

  // Check for duplicate integrationRef (should be unique)
  const integrationDuplicates = new Map<string, typeof allProducts>();
  allProducts.forEach((product) => {
    if (product.integrationRef) {
      if (!integrationDuplicates.has(product.integrationRef)) {
        integrationDuplicates.set(product.integrationRef, []);
      }
      integrationDuplicates.get(product.integrationRef)!.push(product);
    }
  });

  const integrationDupes = Array.from(integrationDuplicates.entries()).filter(
    ([_, products]) => products.length > 1
  );

  if (integrationDupes.length > 0) {
    console.log(`❌ Found ${integrationDupes.length} duplicate integrationRef(s):`);
    integrationDupes.forEach(([ref, products]) => {
      console.log(`\n  integrationRef: ${ref} (${products.length} duplicates)`);
      products.forEach((p) => {
        console.log(
          `    - ${p.name} (id: ${p.id}, active: ${p.active}, visible: ${p.visible}, created: ${p.createdAt.toISOString()})`
        );
      });
    });
    console.log('');
  } else {
    console.log('✅ No duplicate integrationRef found\n');
  }

  // Check for duplicate blueprintId (not unique, but might indicate duplicates)
  const blueprintDuplicates = new Map<number, typeof allProducts>();
  allProducts.forEach((product) => {
    if (product.blueprintId) {
      if (!blueprintDuplicates.has(product.blueprintId)) {
        blueprintDuplicates.set(product.blueprintId, []);
      }
      blueprintDuplicates.get(product.blueprintId)!.push(product);
    }
  });

  const blueprintDupes = Array.from(blueprintDuplicates.entries()).filter(
    ([_, products]) => products.length > 1
  );

  if (blueprintDupes.length > 0) {
    console.log(`⚠️  Found ${blueprintDupes.length} products sharing blueprintId(s):`);
    console.log('   (This is allowed, but might indicate duplicates)\n');
    blueprintDupes.slice(0, 10).forEach(([id, products]) => {
      console.log(`  blueprintId: ${id} (${products.length} products)`);
      products.forEach((p) => {
        console.log(
          `    - ${p.name} (id: ${p.id}, printifyProductId: ${p.printifyProductId || 'N/A'}, active: ${p.active}, visible: ${p.visible})`
        );
      });
    });
    if (blueprintDupes.length > 10) {
      console.log(`\n  ... and ${blueprintDupes.length - 10} more blueprintId groups`);
    }
    console.log('');
  } else {
    console.log('✅ No products sharing blueprintId found\n');
  }

  // Check for duplicate names (not unique, but might indicate duplicates)
  const nameDuplicates = new Map<string, typeof allProducts>();
  allProducts.forEach((product) => {
    const normalizedName = product.name.toLowerCase().trim();
    if (!nameDuplicates.has(normalizedName)) {
      nameDuplicates.set(normalizedName, []);
    }
    nameDuplicates.get(normalizedName)!.push(product);
  });

  const nameDupes = Array.from(nameDuplicates.entries()).filter(
    ([_, products]) => products.length > 1
  );

  if (nameDupes.length > 0) {
    console.log(`⚠️  Found ${nameDupes.length} products with duplicate names:`);
    console.log('   (This is allowed, but might indicate duplicates)\n');
    nameDupes.slice(0, 10).forEach(([name, products]) => {
      console.log(`  Name: "${name}" (${products.length} products)`);
      products.forEach((p) => {
        console.log(
          `    - id: ${p.id}, printifyProductId: ${p.printifyProductId || 'N/A'}, blueprintId: ${p.blueprintId || 'N/A'}, active: ${p.active}, visible: ${p.visible}`
        );
      });
    });
    if (nameDupes.length > 10) {
      console.log(`\n  ... and ${nameDupes.length - 10} more duplicate name groups`);
    }
    console.log('');
  } else {
    console.log('✅ No duplicate names found\n');
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Total products: ${allProducts.length}`);
  console.log(`   Active products: ${allProducts.filter((p) => p.active).length}`);
  console.log(`   Visible products: ${allProducts.filter((p) => p.visible).length}`);
  console.log(`   Critical duplicates (printifyProductId/integrationRef): ${printifyDupes.length + integrationDupes.length}`);
  console.log(`   Potential duplicates (blueprintId/name): ${blueprintDupes.length + nameDupes.length}`);

  await prisma.$disconnect();
}

checkDuplicates().catch((error) => {
  console.error('Error checking duplicates:', error);
  process.exit(1);
});

