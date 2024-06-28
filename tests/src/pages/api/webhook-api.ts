import { Page } from 'playwright';

export default class WebhookApiPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async addWebhookToDb(webhookUrl: string) {
        const requestBody = {
            webhook: webhookUrl
        };

        const response = await this.page.request.post('/api/webhook/create', {
            data: JSON.stringify(requestBody)
        });

        return response;
    }

    async removeWebhookFromDb(webhookUrl: string) {
        const requestBody = {
            webhook: webhookUrl
        };

        const response = await this.page.request.post('/api/webhook/delete', {
            data: JSON.stringify(requestBody)
        });

        return response;
    }
}