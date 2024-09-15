import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Converts import.meta.url to __filename and __dirname.
 * 
 * `__filename` - The current module's filename.
 * `__dirname` - The current module's directory name.
 * 
 * This is necessary because `import.meta.url` provides a URL, not a file path,
 * and we need to convert it to a format compatible with Node.js file system operations.
 * 
 * @see https://nodejs.org/api/esm.html#importmetaurl
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads environment variables from a `.env` file based on the current NODE_ENV.
 * 
 * The path to the `.env` file is resolved using the current directory and
 * the NODE_ENV environment variable. This allows for different environment
 * configurations (development, production, etc.).
 * 
 * Example:
 * If NODE_ENV is 'development', it will load environment variables from `.env.development`.
 * 
 * @see https://github.com/motdotla/dotenv
 */
dotenv.config({
    path: path.resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`)
});

/**
 * Export configuration variables loaded from the environment.
 * 
 * This object contains the environment-specific settings that can be used
 * throughout the application, such as database credentials and server settings.
 * 
 * @property {string} NODE_ENV - The current environment (e.g., development, production).
 * @property {string} DB_HOST - The database host.
 * @property {string} DB_USER - The database user.
 * @property {string} DB_PASS - The database password.
 * @property {string} DB_PORT - The database port.
 * @property {string} DB_NAME - The database name.
 * 
 * Usage:
 * Import this configuration object wherever you need access to these settings.
 * 
 * Example:
 * const config = require('./path/to/this/file');
 * console.log(config.DB_HOST); // Access the DB_HOST environment variable
 */
export default {
    NODE_ENV : String(process.env.NODE_ENV),
    DB_HOST : String(process.env.DB_HOST),
    DB_USER : String(process.env.DB_USER),
    DB_PASS:  String(process.env.DB_PASS),
    DB_PORT:  String(process.env.DB_PORT),
    DB_NAME:  String(process.env.DB_NAME),
};