import express from 'express';
import validator from 'validator';
import pool from '../../db/db.js';
import { validateWebhookURL } from '../middleware/validateWebhookURL.js';

const webhookRouter = express.Router();

webhookRouter.post('/create', validateWebhookURL, async (req, res) => {
    const { webhook } = req.body;
  
    try {
        const query = 'INSERT INTO webhooks (webhook_url, created_at) VALUES ($1, NOW())';
        const values = [webhook];
  
        const result = await pool.query(query, values);

        res.status(200).send({
            message: `Webhook ${webhook} added successfully`,
        });
    } catch (err) {
        console.error('Error inserting webhook:', err);
        res.status(500).send({
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
            res.status(200).send({
            message: `Webhook with URL ${webhook} deleted successfully`,
            });
        } else {
            res.status(404).send({
            error: `Webhook with URL ${webhook} not found`,
            });
        }
    } catch (err) {
        console.error('Error deleting webhook:', err);
        res.status(500).send({
            error: 'Error deleting webhook',
        });
    }
});

export default webhookRouter;