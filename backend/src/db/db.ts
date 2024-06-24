import pg from 'pg';
import config from '../config/config';

const { Pool } = pg;
 
const pool = new Pool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASS,
  port: Number(config.DB_PORT),
  database: config.DB_NAME,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export default pool;