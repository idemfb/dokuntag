import { defineConfig } from '@prisma/internals';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  datasource: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
});
