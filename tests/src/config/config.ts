import dotenv from 'dotenv';
import path from 'path';

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
 * @property {string} DISCORD_WEBHOOK_URL - Valid discord webhook URL.
 * @property {string} DISCORD_WEBHOOK_URL_FOR_API_TESTS - Valid discord webhook URL.
 * @property {string} API_URL - URL API is hosted at.
 * 
 * Usage:
 * Import this configuration object wherever you need access to these settings.
 * 
 * Example:
 * const config = require('./path/to/this/file');
 * console.log(config.DB_HOST); // Access the DB_HOST environment variable
 */
export default {
    NODE_ENV : process.env.NODE_ENV || "",
    DB_HOST : process.env.DB_HOST || "",
    DB_USER : process.env.DB_USER || "",
    DB_PASS:  process.env.DB_PASS || "",
    DB_PORT:  process.env.DB_PORT || "",
    DB_NAME:  process.env.DB_NAME || "",
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || "",
    DISCORD_WEBHOOK_URL_FOR_API_TESTS: process.env.DISCORD_WEBHOOK_URL || "",
    API_URL: process.env.API_URL || "",
};