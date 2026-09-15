import { Global, Module } from "@nestjs/common";
import pg from "pg";

export const PG_POOL = "PG_POOL";

const { Pool } = pg;

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () => {
        return new Pool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASS,
          port: Number(process.env.DB_PORT),
          database: process.env.DB_NAME,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });
      },
    },
  ],
  exports: [PG_POOL],
})
export class DbModule {}
