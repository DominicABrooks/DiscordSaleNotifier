import { APIRequestContext, APIResponse, request } from '@playwright/test';
import config from '../../config/config';

export default class WebhookApiPage {
    private apiRequestContext: APIRequestContext;

    /**
     * Initializes the API request context with the specified base URL.
     * This method should be called before making any API requests.
     *
     * @returns {Promise<void>} - Returns a Promise that resolves when the context is initialized.
     */
    async init(): Promise<void> {
        this.apiRequestContext = await request.newContext({
            extraHTTPHeaders: {
                'Content-Type': 'application/json'
            },
            baseURL: config.API_URL,
        });
    }

    /**
     * Adds a new webhook to the database.
     * 
     * @param {string} webhookUrl - The URL of the webhook to be added to the database.
     * @returns {Promise<Response>} - Returns a Promise that resolves to the response from the server.
     * 
     * @example
     * const webhookApi = new WebhookApiPage();
     * await webhookApi.init();
     * const response = await webhookApi.addWebhookToDb('https://example.com/webhook');
     * if (response.ok()) {
     *     console.log('Webhook added successfully');
     * }
     */
    async addWebhook(webhookUrl: string): Promise<APIResponse> {
        const requestBody = {
            webhook: webhookUrl
        };

        const response = await this.apiRequestContext.post('/api/webhook/create', {
            data: JSON.stringify(requestBody)
        });

        return response;
    }

    /**
     * Removes a webhook from the database.
     * 
     * @param {string} webhookUrl - The URL of the webhook to be removed from the database.
     * @returns {Promise<Response>} - Returns a Promise that resolves to the response from the server.
     * 
     * @example
     * const webhookApi = new WebhookApiPage();
     * await webhookApi.init();
     * const response = await webhookApi.removeWebhookFromDb('https://example.com/webhook');
     * if (response.ok()) {
     *     console.log('Webhook removed successfully');
     * }
     */
    async removeWebhook(webhookUrl: string): Promise<APIResponse> {
        const requestBody = {
            webhook: webhookUrl
        };

        const response = await this.apiRequestContext.delete('/api/webhook/delete', {
            data: JSON.stringify(requestBody)
        });

        return response;
    }
}