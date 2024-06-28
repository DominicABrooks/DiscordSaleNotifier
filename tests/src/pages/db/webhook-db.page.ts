import assert from 'assert';
import pool from '../db/db.js';

/**
 * Class representing database operations related to webhooks.
 */
export default class WebhookDbPage {
    /**
     * Checks if a webhook URL exists in the database.
     *
     * @param {string} webhook - The webhook URL to check for existence in the database.
     * @returns {Promise<boolean>} - Returns a Promise resolving to true if the webhook URL exists in the database, false otherwise.
     * @throws {Error} - Throws an error if there is an issue querying the database.
     */
    async checkWebhookExists(webhook: string): Promise<boolean> {
        try {
            const queryCheckExistence = 'SELECT COUNT(*) FROM webhooks WHERE webhook_url = $1';
            const valuesCheckExistence = [webhook];
            
            const { rows } = await pool.query(queryCheckExistence, valuesCheckExistence);
            const webhookExists = parseInt(rows[0].count) > 0;
            
            return webhookExists;
        } catch (error) {
            throw new Error(`Failed to check webhook existence in the database: ${error.message}`);
        }
    }

    /**
     * Clears all records from the 'webhooks' table.
     *
     * @throws {Error} - Throws an error if there is an issue truncating the table.
     */
    async clearTable(): Promise<void> {
        try {
            const query = `TRUNCATE TABLE webhooks`;
            await pool.query(query);
        } catch (error) {
            console.error(`Error clearing table webhooks`, error);
            throw new Error(`Failed to clear table webhooks: ${error.message}`);
        }
    }

    /**
     * Asserts that a webhook URL exists in the database.
     *
     * @param {string} webhook - The webhook URL to assert existence.
     * @throws {AssertionError} - Throws an assertion error if the webhook does not exist.
     */
    async assertWebhookExists(webhook: string): Promise<void> {
        const webhookExists = await this.checkWebhookExists(webhook);
        assert(webhookExists, `Webhook ${webhook} does not exist in the database`);
    }
    
    /**
     * Asserts that a webhook URL does not exist in the database.
     *
     * @param {string} webhook - The webhook URL to assert non-existence.
     * @throws {AssertionError} - Throws an assertion error if the webhook exists.
     */
    async assertWebhookDoesNotExist(webhook: string): Promise<void> {
        const webhookExists = await this.checkWebhookExists(webhook);
        assert(!webhookExists, `Webhook ${webhook} exists in the database`);
    }
}