import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`)
});

export default {
    NODE_ENV : process.env.NODE_ENV,

    DB_HOST : process.env.DB_HOST,
    DB_USER : process.env.DB_USER,
    DB_PASS:  process.env.DB_PASS,
    DB_PORT:  process.env.DB_PORT,
    DB_NAME:  process.env.DB_NAME,
}