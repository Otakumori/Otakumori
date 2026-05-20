import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  console.log("✅ Connected");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
