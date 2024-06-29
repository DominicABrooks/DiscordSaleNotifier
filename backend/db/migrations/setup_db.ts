import path from 'path';
import pool from '../db.js';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __filename and __dirname for use with file system operations.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to the SQL script file for creating the sales table.
const createWebhookTablePath = path.resolve(__dirname, '../../../db/scripts/create_webhook_table.sql');
const createSalesTablePath = path.resolve(__dirname, '../../../db/scripts/create_sales_table.sql'); // Adjust the path as necessary

(async () => {
  try {
    /**
     * Read the SQL script file to get the query for creating the sales table.
     */
    const createSalesTableQuery = await fs.readFile(createSalesTablePath, 'utf-8');

    /**
     * Execute the SQL query to create the sales table.
     */
    await pool.query(createSalesTableQuery);
    console.log('Sales table created successfully.');

    /**
     * Read the SQL script file to get the query for creating the webhook table.
     */
    const createWebhookTableQuery = await fs.readFile(createWebhookTablePath, 'utf-8');

    /**
     * Execute the SQL query to create the webhook table.
     */
    await pool.query(createWebhookTableQuery);
    console.log('Webhook table created successfully.');
  } catch (error) {
    /**
     * Handle errors that occur during the file read or database operation.
     */
    console.error('Error creating tables:', error);
  } finally {
    /**
     * Close the database connection pool.
     */
    await pool.end();
  }
})();