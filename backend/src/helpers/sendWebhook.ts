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
            throw new Error(`Failed to send message to Discord webhook. Status: ${response.status}`);
        }

        // Return the response if the request was successful
        return response;
    } catch (err) {
        // Log the error to the console and rethrow it
        console.error('Error sending message to Discord webhook:', err);
        throw err;
    }
};

export default sendToDiscordWebhook;
