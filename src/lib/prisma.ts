import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/config/env";

/**
 * Prisma Database Client (Singleton)
 *
 * Reuses a single PrismaClient instance across hot-reloads in development
 * and across requests in production to avoid exhausting database connections.
 *
 * Usage:
 *   import { prisma } from "@/lib/prisma";
 *   const users = await prisma.user.findMany();
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
