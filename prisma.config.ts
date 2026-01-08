import { defineConfig } from "prisma/config";
import path from "node:path";
import { config } from "dotenv";

// Carrega variáveis do .env.development
config({ path: ".env" });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "node prisma/seed.js", // Remove dotenv-cli aqui, pois já carregamos as variáveis
  },
  
  datasource: {
    // url: process.env.DATABASE_URL || "",
    shadowDatabaseUrl: process.env.DATABASE_URL || "",
  },
});
