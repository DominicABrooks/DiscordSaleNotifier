import path from 'path';
import pool from '../db.js';
import fs from 'node:fs/promises'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// Resolve the path by moving up one level from 'dist' to 'backend', then into 'db/scripts'
const filePath = path.resolve(__dirname, '../../../db/scripts/create_webhook_table.sql');

try {
    // Read and parse the SQL queries as a string
    const createWebhookTableQuery = await fs.readFile(filePath,'utf-8')
    // Execute the query to create the table
    await pool.query(createWebhookTableQuery);
    console.log('Webhook table created successfully.');
} catch (error) {
    console.error('Error creating table:', error);
} finally {
    // Close the pool to end the database connection
    await pool.end();
}