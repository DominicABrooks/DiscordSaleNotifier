import path from 'path';
import pool from '../db.js';
import pg from 'pg';
import config from '../../src/config/config.js';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// Convert import.meta.url to __filename and __dirname for use with file system operations.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the paths to the idempotent SQL schema files (safe to re-run).
const createWebhookTablePath = path.resolve(__dirname, '../../../db/scripts/create_webhook_table.sql');
const createSalesTablePath = path.resolve(__dirname, '../../../db/scripts/create_sales_table.sql');

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
    database: 'postgres',
  });
  try {
    const { rows } = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
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
  try {
    /**
     * Create the database if it does not exist yet.
     */
    await ensureDatabaseExists();

    /**
     * Read the SQL script file to get the query for creating the sales table.
     */
    const createSalesTableQuery = await fs.readFile(createSalesTablePath, 'utf-8');

    /**
     * Execute the SQL query to ensure the sales table exists.
     */
    await pool.query(createSalesTableQuery);
    console.log('Sales table ensured successfully.');

    /**
     * Read the SQL script file to get the query for creating the webhook table.
     */
    const createWebhookTableQuery = await fs.readFile(createWebhookTablePath, 'utf-8');

    /**
     * Execute the SQL query to ensure the webhook table exists.
     */
    await pool.query(createWebhookTableQuery);
    console.log('Webhook table ensured successfully.');
  } catch (error) {
    /**
     * Handle errors that occur during the file read or database operation.
     */
    console.error('Error setting up database:', error);
    process.exitCode = 1;
  } finally {
    /**
     * Close the database connection pool.
     */
    await pool.end();
  }
})();
