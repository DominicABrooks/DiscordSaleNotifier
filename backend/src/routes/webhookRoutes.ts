import express from 'express';
import validator from 'validator';
import pool from '../../db/db.js'; // Import the PostgreSQL pool instance for database operations
import { validateWebhookURL } from '../middleware/validateWebhookURL.js'; // Import the middleware for validating webhook URLs
import sendToDiscordWebhook from '../helpers/sendWebhook.js'; // Import the helper function to send messages to a Discord webhook
import getFromWebhook from '../helpers/getWebhook.js';

const webhookRouter = express.Router(); // Create a new router instance for handling webhook-related routes

/**
 * Route to handle adding a new webhook URL to the database.
 * 
 * POST /api/webhook/create
 * 
 * - Validates the webhook URL using the `validateWebhookURL` middleware.
 * - Sends a message to the provided Discord webhook to confirm tracking.
 * - Checks if the webhook URL already exists in the database.
 * - If not, inserts the new webhook URL into the database.
 * 
 * Request Body:
 * @param {string} webhook - The Discord webhook URL to be added.
 * 
 * Responses:
 * - 200: Webhook added successfully.
 * - 400: Webhook already exists or initial POST to webhook failed.
 * - 500: Error inserting webhook into the database.
 */
webhookRouter.post('/create', validateWebhookURL, async (req, res) => {
    const { webhook } = req.body;

    // Send an initial fetch to the Discord webhook
    try {
        await getFromWebhook(webhook);
    } catch (err) {
        console.error('Failed to fetch webhook: ', err);
        return res.status(400).send({
            message: `Failed to GET webhook`,
        });
    }

    // Check if the webhook URL already exists in the database and insert it if not
    try {
        const queryCheckExistence = 'SELECT COUNT(*) FROM webhooks WHERE webhook_url = $1';
        const valuesCheckExistence = [webhook];
      
        const { rows } = await pool.query(queryCheckExistence, valuesCheckExistence);
        const webhookExists = parseInt(rows[0].count) > 0;
    
        if (webhookExists) {
            return res.status(400).send({
                error: 'Webhook already exists',
            });
        }

        const query = 'INSERT INTO webhooks (webhook_url, created_at) VALUES ($1, NOW())';
        const values = [webhook];
  
        const result = await pool.query(query, values);

        const payload = {
            content: "Tracking added successfully!"
        };
        await sendToDiscordWebhook(webhook, payload);

        return res.status(200).send({
            message: `Webhook added successfully!`,
        });
    } catch (err) {
        console.error('Error inserting webhook:', err);
        return res.status(500).send({
            error: 'Error inserting webhook to DB',
        });
    }
});

/**
 * Route to handle deleting an existing webhook URL from the database.
 * 
 * DELETE /api/webhook/delete
 * 
 * - Validates the webhook URL using the `validateWebhookURL` middleware.
 * - Deletes the webhook URL from the database if it exists.
 * 
 * Request Body:
 * @param {string} webhook - The Discord webhook URL to be deleted.
 * 
 * Responses:
 * - 200: Webhook deleted successfully.
 * - 404: Webhook not found in the database.
 * - 500: Error deleting webhook from the database.
 */
webhookRouter.delete('/delete', validateWebhookURL, async (req, res) => {
    const { webhook } = req.body;
  
    try {
        const query = 'DELETE FROM webhooks WHERE webhook_url = $1';
        const values = [webhook];
    
        const result = await pool.query(query, values);
  
        if (result.rowCount && result.rowCount > 0) {
            return res.status(200).send({
                message: `Webhook deleted successfully`,
            });
        } else {
            return res.status(404).send({
                error: `Webhook not found`,
            });
        }
    } catch (err) {
        console.error('Error deleting webhook:', err);
        return res.status(500).send({
            error: 'Error deleting webhook',
        });
    }
});

export default webhookRouter;