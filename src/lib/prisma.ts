import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

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
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
