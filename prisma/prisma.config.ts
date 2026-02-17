export default {
  schema: "./prisma/schema.prisma",
  migrate: {
    datasource: {
      url: process.env.DATABASE_URL || "file:./prisma/dev.db"
    }
  }
};
