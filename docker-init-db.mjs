import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Scan" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "query" TEXT NOT NULL,
      "queryType" TEXT NOT NULL,
      "email" TEXT,
      "website" TEXT,
      "github" TEXT,
      "overallScore" INTEGER,
      "developerScore" INTEGER,
      "portfolioScore" INTEGER,
      "reportJson" TEXT NOT NULL,
      "bookmarked" BOOLEAN NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )
  `);

  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS "Scan_query_idx" ON "Scan"("query")'
  );
  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS "Scan_createdAt_idx" ON "Scan"("createdAt")'
  );
  await prisma.$executeRawUnsafe(
    'CREATE INDEX IF NOT EXISTS "Scan_bookmarked_idx" ON "Scan"("bookmarked")'
  );
} finally {
  await prisma.$disconnect();
}
