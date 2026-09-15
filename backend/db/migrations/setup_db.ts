import pg from "pg";
import { DataSource } from "typeorm";
import config from "../../src/config/config.js";
import { Sale } from "../../src/db/entities/sale.entity.js";
import { Webhook } from "../../src/db/entities/webhook.entity.js";

const { Pool } = pg;

/**
 * Ensure the configured database exists, creating it if necessary.
 * Connects to the built-in `postgres` database to perform this check.
 */
async function ensureDatabaseExists(): Promise<void> {
  const dbName = config.DB_NAME;
  if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
    throw new Error(`Refusing to create database with unexpected name: ${dbName}`);
  }
  const adminPool = new Pool({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASS,
    port: Number(config.DB_PORT),
    database: "postgres",
  });
  try {
    const { rows } = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (rows.length === 0) {
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } finally {
    await adminPool.end();
  }
}

(async () => {
  let dataSource: DataSource | undefined;
  try {
    await ensureDatabaseExists();

    dataSource = new DataSource({
      type: "postgres",
      host: config.DB_HOST,
      username: config.DB_USER,
      password: config.DB_PASS,
      port: Number(config.DB_PORT),
      database: config.DB_NAME,
      entities: [Webhook, Sale],
      synchronize: true,
    });
    await dataSource.initialize();
    await dataSource.synchronize();
    console.log("Database schema synchronized successfully (webhooks, sales).");
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exitCode = 1;
  } finally {
    await dataSource?.destroy().catch(() => undefined);
  }
})();
