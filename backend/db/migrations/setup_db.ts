import path from 'path';
import pool from '../db.js';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __filename and __dirname for use with file system operations.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to the SQL script file.
// This assumes the current file is in the 'dist' directory and we need to move up to 'backend' and into 'db/scripts'.
const filePath = path.resolve(__dirname, '../../../db/scripts/create_webhook_table.sql');

(async () => {
  try {
    /**
     * Read the SQL script file to get the query for creating the webhook table.
     * 
     * @returns {Promise<string>} - The SQL query read from the file.
     */
    const createWebhookTableQuery = await fs.readFile(filePath, 'utf-8');

    /**
     * Execute the SQL query to create the webhook table.
     * 
     * The pool.query method is used to run the SQL query, which should create the table
     * as defined in the SQL script.
     * 
     * @returns {Promise<void>}
     */
    await pool.query(createWebhookTableQuery);
    console.log('Webhook table created successfully.');
  } catch (error) {
    /**
     * Handle errors that occur during the file read or database operation.
     * 
     * If there is an issue reading the file or executing the SQL query, it will be caught here.
     * 
     * @param {Error} error - The error object caught during the operation.
     */
    console.error('Error creating table:', error);
  } finally {
    /**
     * Close the database connection pool.
     * 
     * It is important to close the pool after completing database operations to free up resources.
     * 
     * @returns {Promise<void>}
     */
    await pool.end();
  }
})();