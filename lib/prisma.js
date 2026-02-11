// lib/prisma.js
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; // if you installed adapter

// create adapter if using adapter
const adapter = process.env.DATABASE_URL ? new PrismaPg({ connectionString: process.env.DATABASE_URL }) : undefined;

const globalForPrisma = globalThis;

// If adapter exists pass it, otherwise create client w/out adapter (depends on your setup)
const _prisma = globalForPrisma.__prisma_client__ ?? new PrismaClient(adapter ? { adapter } : undefined);

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.__prisma_client__ = _prisma;
}

// Named export `db` (so `import { db } from "./prisma"` works)
export const db = _prisma;

// Also provide default export in case any file uses default import
export default _prisma;

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
