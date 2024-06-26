import express from 'express';
import validator from 'validator';
import pool from '../../db/db.js';
import { validateWebhookURL } from '../middleware/validateWebhookURL.js';
import sendToDiscordWebhook from '../helpers/sendWebhook.js'

const webhookRouter = express.Router();

webhookRouter.post('/create', validateWebhookURL, async (req, res) => {
    const { webhook } = req.body;

    // Add logic that POST to the Discord webhook "Tracking Added Successfully!"
    try {
        const payload = {
            content: "Tracking added successfully!"
        };

        await sendToDiscordWebhook(webhook, payload);
    } catch (err) {
        console.error('Error in initial POST to webhook:', err);
        return res.status(400).send({
            message: `Failed to POST webhook`,
        });
    }

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

        return res.status(200).send({
            message: `Webhook added successfully!`,
        });
    } catch (err) {
        console.error('Error inserting webhook:', err);
        return res.status(500).send({
            error: 'Error inserting webhook',
        });
    }
});

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