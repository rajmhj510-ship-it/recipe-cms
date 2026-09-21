import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const rawConnectionString = process.env.DATABASE_URL;

// Keep the current pg-connection-string security semantics explicit and avoid
// the deprecation warning emitted for the legacy sslmode aliases.
const connectionString = rawConnectionString?.replace(
  /([?&]sslmode=)(prefer|require|verify-ca)(?=(&|$))/i,
  "$1verify-full",
);

const adapter = new PrismaPg({
  connectionString,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
