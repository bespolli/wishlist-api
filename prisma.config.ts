import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load .env for Prisma CLI
config();

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL is not defined in .env');
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
