import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.warn("Seeding database...");
  // Add your seed data here
  console.warn("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
