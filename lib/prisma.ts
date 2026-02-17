import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.VITEST || process.env.NODE_ENV === 'test';

let prisma: PrismaClient;

if (isTest) {
  prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: isDev ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  prisma = global.prisma;
}

export { prisma };