import pg from 'pg';
import config from '../../config/config.js';

// Destructure the Pool class from the pg library
const { Pool } = pg;

/**
 * Create a new PostgreSQL connection pool.
 * 
 * The pool configuration is derived from the environment-specific configuration loaded
 * earlier in the application. This allows the database connection to be managed efficiently
 * with pooling, reducing the overhead of establishing connections for each query.
 * 
 * @see https://node-postgres.com/features/connecting#pooling
 */
const pool = new Pool({
  host: config.DB_HOST,           // Database server host
  user: config.DB_USER,           // Database user
  password: config.DB_PASS,       // Database user's password
  port: Number(config.DB_PORT),   // Database server port (converted to number)
  database: config.DB_NAME,       // Name of the database to connect to
  max: 20,                        // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,       // How long a client is allowed to remain idle before being closed (30 seconds)
  connectionTimeoutMillis: 2000,  // Maximum time, in milliseconds, to wait for a new client connection (2 seconds)
});

/**
 * Export the configured pool instance for use in other parts of the application.
 * 
 * Other modules can import this pool to execute queries on the database using
 * the connection pooling mechanism.
 * 
 * Example usage:
 * 
 * const pool = require('./path/to/this/file');
 * pool.query('SELECT * FROM table', (err, res) => {
 *   // Handle query result
 * });
 * 
 * @module pool
 */
export default pool;