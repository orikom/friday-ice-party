import { defineConfig, env } from "prisma/config";
import { config } from "dotenv";

// Load .env file for prisma config
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
