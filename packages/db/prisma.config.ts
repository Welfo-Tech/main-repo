import { neonConfig, Pool } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { defineConfig } from "prisma/config";
import ws from "ws";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrate: {
    async adapter(env) {
      neonConfig.webSocketConstructor = ws;
      const pool = new Pool({ connectionString: env.DATABASE_URL });
      return new PrismaNeon(pool);
    },
  },
});
