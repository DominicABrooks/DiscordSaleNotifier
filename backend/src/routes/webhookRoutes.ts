import express from 'express';
import validator from 'validator';
import pool from '../../db/db.js'; // Import the PostgreSQL pool instance for database operations
import { validateWebhookURL } from '../middleware/validateWebhookURL.js'; // Import the middleware for validating webhook URLs
import { sendToDiscordWebhook } from '../helpers/sendWebhook.js'; // Import the helper function to send messages to a Discord webhook
import getFromWebhook from '../helpers/getWebhook.js';

const webhookRouter = express.Router(); // Create a new router instance for handling webhook-related routes

/**
 * @swagger
 * /api/webhook/create:
 *   post:
 *     summary: Add a new webhook URL to the database
 *     description: Adds a new webhook URL to the database. Validates the URL using the `validateWebhookURL` middleware. Sends a message to the provided Discord webhook to confirm tracking and checks if it already exists in the database. If the webhook URL is not already present, it inserts the new URL into the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhook:
 *                 type: string
 *                 description: The Discord webhook URL to be added.
 *                 example: 'https://discord.com/api/webhooks/...'
 *     responses:
 *       200:
 *         description: Webhook added successfully.
 *       400:
 *         description: Webhook already exists or initial POST to webhook failed.
 *       500:
 *         description: Error inserting webhook into the database.
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
 * @swagger
 * /api/webhook/delete:
 *   delete:
 *     summary: Delete an existing webhook URL
 *     description: Deletes a webhook URL from the database. The request URL must be validated using the `validateWebhookURL` middleware before the webhook is deleted.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               webhook:
 *                 type: string
 *                 description: The Discord webhook URL to be deleted.
 *                 example: 'https://discord.com/api/webhooks/...'
 *     responses:
 *       200:
 *         description: Webhook deleted successfully.
 *       404:
 *         description: Webhook not found in the database.
 *       500:
 *         description: Error deleting webhook from the database.
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