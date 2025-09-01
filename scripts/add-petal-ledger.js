 
 
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPetalLedger() {
  try {
    console.log('Adding PetalLedger table...');

    // Create the enum type first
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "PetalTxnType" AS ENUM ('EARN','SPEND','ADJUST');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create the PetalLedger table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "petal_ledger" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" "PetalTxnType" NOT NULL,
        "amount" INTEGER NOT NULL,
        "balance" INTEGER NOT NULL,
        "reason" TEXT NOT NULL,
        "metadata" JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Add foreign key constraint
    await prisma.$executeRaw`
      ALTER TABLE "petal_ledger" 
      ADD CONSTRAINT "petal_ledger_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
    `;

    // Add indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "PetalLedger_userId_createdAt_idx" 
      ON "petal_ledger"("userId","createdAt");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "PetalLedger_userId_type_createdAt_idx" 
      ON "petal_ledger"("userId","type","createdAt");
    `;

    console.log('✅ PetalLedger table created successfully!');

    // Optional: Add a one-time backfill for existing users
    console.log('Adding initial balance records for existing users...');

    const users = await prisma.user.findMany({
      select: { id: true, petals: true },
    });

    for (const user of users) {
      if (user.petals > 0) {
        await prisma.petalLedger.create({
          data: {
            userId: user.id,
            type: 'ADJUST',
            amount: user.petals,
            balance: user.petals,
            reason: 'INITIAL_BALANCE',
            metadata: { note: 'Initial balance backfill' },
          },
        });
        console.log(`✅ Added initial balance record for user ${user.id}: ${user.petals} petals`);
      }
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addPetalLedger()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
