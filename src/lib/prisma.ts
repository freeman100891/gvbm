import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function getDatabaseUrl(): string {
  // If user provided a cloud database URL (e.g. Supabase, PostgreSQL, PlanetScale, Neon)
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // On Vercel / AWS Lambda Serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = '/tmp/dev.db';
    
    // Copy bundled seed database to writable /tmp on first invocation
    if (!fs.existsSync(tmpDbPath)) {
      const candidatePaths = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
      ];

      let copied = false;
      for (const cand of candidatePaths) {
        if (fs.existsSync(cand)) {
          try {
            fs.copyFileSync(cand, tmpDbPath);
            copied = true;
            console.log(`Successfully initialized SQLite database from ${cand} to ${tmpDbPath}`);
            break;
          } catch (err) {
            console.error(`Failed to copy ${cand} to /tmp:`, err);
          }
        }
      }

      if (!copied) {
        console.warn('Seed database file not found in candidates, creating fresh SQLite file in /tmp');
        try {
          fs.writeFileSync(tmpDbPath, '');
        } catch (e) {
          console.error('Failed to create empty /tmp/dev.db:', e);
        }
      }
    }

    return `file:${tmpDbPath}`;
  }

  // Local development
  return process.env.DATABASE_URL || 'file:./prisma/dev.db';
}

const dbUrl = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
