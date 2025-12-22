import { PrismaClient } from "@prisma/client";
import path from "path";

const datasourceUrl =
  process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "prisma", "dev.db")}`;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: datasourceUrl } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
