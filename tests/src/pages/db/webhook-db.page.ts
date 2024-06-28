import assert from 'assert';
import pool from '../db/db.js';

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

    async assertWebhookExists(webhook: string) {
        const webhookExists = await this.checkWebhookExists(webhook)
        assert(webhookExists);
    }
    
    async assertWebhookDoesNotExist(webhook: string) {
        const webhookExists = await this.checkWebhookExists(webhook)
        assert(!webhookExists);
    }
}