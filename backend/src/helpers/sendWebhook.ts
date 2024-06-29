import Bottleneck from 'bottleneck';
import pool from '../../db/db.js'

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
const sendToDiscordWebhook = async (hookURL: string, payload: any): Promise<Response> => {
    try {
        // Send a POST request to the Discord webhook URL with the specified payload
        const response = await fetch(hookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) // Convert the payload to a JSON string
        });

        // Check if the response is not OK (status code outside the range 200-299)
        if (!response.ok) {
            const errorMessage = `Failed to send message to Discord webhook. Status: ${response.status}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        // Return the response if the request was successful
        return response;
    } catch (err) {
        // Log the error to the console and handle the error gracefully
        console.error('Error sending message to Discord webhook:', err);
        throw err; // Rethrow the error to propagate it upwards or handle as needed
    }
};


// Initialize Bottleneck instance with default settings
let limiter = new Bottleneck({
    maxConcurrent: 1, // Start with 1 concurrent request
    minTime: 1000 // Default minimum time (1 second) between requests
});
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
        const tasks = hookUrls.map(hookURL => () => limiter.schedule(() => sendToDiscordWebhook(hookURL, payload)));

        // Execute all tasks concurrently using bottleneck
        await Promise.all(tasks.map(task => task()));

        // Log success message
        console.log('Messages sent to Discord webhooks');
    } catch (err) {
        // Log the error to the console and rethrow it
        console.error('Error sending messages to Discord webhooks:', err);
    }
};

// Function to update limiter based on rate limit headers
const updateLimiterFromHeaders = (headers: Headers): void => {
    const limit = parseInt(headers.get('x-ratelimit-limit') || '5', 10); // Default to 5 if header not present
    const remaining = parseInt(headers.get('x-ratelimit-remaining') || '0', 10);
    const resetAfter = parseFloat(headers.get('x-ratelimit-reset-after') || '1');

    // Calculate the minimum time between requests based on the rate limit
    const minTime = remaining > 0 ? Math.ceil(resetAfter / remaining * 1000) : resetAfter * 1000;

    // Update limiter with new settings
    limiter = new Bottleneck({
        maxConcurrent: 1, // Limit concurrent requests to 1
        minTime: minTime || 1000 // Default to 1 second minimum time
    });
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