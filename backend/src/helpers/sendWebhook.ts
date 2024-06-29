import Bottleneck from 'bottleneck';
import pool from '../../db/db.js'
import { WebhookClient, APIMessage } from 'discord.js'

/**
 * Sends a payload to a specified Discord webhook URL.
 * 
 * This function uses the `fetch` API to send a POST request to a Discord webhook. 
 * The payload is sent as JSON. If the request fails, it throws an error.
 * 
 * @param {string} hookURL - The Discord webhook URL to which the message is sent.
 * @param {any} payload - The data to be sent to the Discord webhook. This should be a JSON-compatible object.
 * @returns {Promise<Response>} - A promise that resolves to the response of the fetch request.
 * 
 * @throws Will throw an error if the request fails (i.e., the response status is not OK).
 * 
 * @example
 * const hookURL = 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token';
 * const payload = {
 *   content: 'Hello, Discord!',
 *   username: 'Bot'
 * };
 * 
 * sendToDiscordWebhook(hookURL, payload)
 *   .then(response => console.log('Message sent successfully:', response))
 *   .catch(err => console.error('Error sending message:', err));
 */
const sendToDiscordWebhook = async (hookURL: string, payload: any): Promise<void> => {
    const webhook = new WebhookClient({url: hookURL});
    webhook.send(payload)
    .catch(console.error);
};

/**
 * Sends a payload to a specified Discord webhook URL.
 * 
 * This function uses the `fetch` API to send a POST request to a Discord webhook. 
 * The payload is sent as JSON. If the request fails, it throws an error.
 * 
 * @param {string} hookURL - The Discord webhook URL to which the message is sent.
 * @param {any} payload - The data to be sent to the Discord webhook. This should be a JSON-compatible object.
 * @returns {Promise<Response>} - A promise that resolves to the response of the fetch request.
 * 
 * @throws {Error} Will throw an error if the request fails (i.e., the response status is not OK).
 * 
 * @example
 * const hookURL = 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token';
 * const payload = {
 *   content: 'Hello, Discord!',
 *   username: 'Bot'
 * };
 * 
 * sendToDiscordWebhook(hookURL, payload)
 *   .then(response => console.log('Message sent successfully:', response))
 *   .catch(err => console.error('Error sending message:', err));
 */
const sendToDiscordWebhookBulk = async (hookUrls: string[], payload: any): Promise<void> => {
    try {
        // Array to store all bottleneck tasks
        const tasks = hookUrls.map(hookURL => () => sendToDiscordWebhook(hookURL, payload));

        // Execute all tasks concurrently using bottleneck
        await Promise.all(tasks.map(task => task()));

        // Log success message
        console.log('Messages sent to Discord webhooks');
    } catch (err) {
        // Log the error to the console and rethrow it
        console.error('Error sending messages to Discord webhooks:', err);
    }
};

/**
 * Sends a payload to all Discord webhook URLs retrieved from the database.
 * 
 * This function fetches Discord webhook URLs from the database using `pool.query` and sends the payload
 * to all fetched webhooks in bulk using `sendToDiscordWebhookBulk`.
 * 
 * @param {any} payload - The data to be sent to the Discord webhooks. This should be a JSON-compatible object.
 * @returns {Promise<void>} - A promise that resolves when all messages are sent successfully.
 * 
 * @throws {Error} Will throw an error if fetching webhook URLs or sending messages fails.
 */
const sendToDiscordWebhooksInDb = async (payload: any): Promise<void> => {
    try {
        // Query to fetch webhook URLs from the database
        const queryResult = await pool.query('SELECT webhook_url FROM webhooks');

        // Extract webhook URLs from query result
        const hookUrls = queryResult.rows.map((row: any) => row.webhook_url);

        // Send payload to all fetched webhook URLs in bulk
        await sendToDiscordWebhookBulk(hookUrls, payload);
    } catch (err) {
        // Log the error to the console and rethrow it
        console.error('Error sending messages to Discord webhooks from DB:', err);
    }
};

export { sendToDiscordWebhook, sendToDiscordWebhookBulk, sendToDiscordWebhooksInDb };