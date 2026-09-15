import { test, expect, APIResponse } from '@playwright/test';
import WebhookDbPage from '../pages/db/webhook-db.page';
import WebhookApiPage from '../pages/api/webhook-api';
import config from '../config/config';

const webhookApi = new WebhookApiPage();
const webhookDb = new WebhookDbPage();
test.beforeAll(async () => {
  await webhookApi.init();
});

test.describe('API Webhook Creation & Deletion Tests', () => {
    // Annotate as serial.
    test.describe.configure({ mode: 'serial' });

    test('Verify adding webhook tracking', async () => {
        await webhookDb.ensureWebhookNotExists(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
        const response: APIResponse = await webhookApi.addWebhook(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
        
        expect(response.ok()).toBeTruthy();
        await webhookDb.assertWebhookExists(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
    });

    //Verify cannot add duplicate webhooks
    test('Verify cannot add duplicate webhooks', async () => {
        await webhookDb.ensureWebhookExists(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
        const response: APIResponse = await webhookApi.addWebhook(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);

        expect(response.status()).toBe(400);
        await webhookDb.assertWebhookExists(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
    });

    // Verify can delete webhook
    test('Verify can delete webhook', async () => {
        await webhookDb.ensureWebhookExists(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
        const response: APIResponse = await webhookApi.removeWebhook(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);

        expect(response.ok()).toBeTruthy();
        await webhookDb.assertWebhookDoesNotExist(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
    });

    // Verify cannot delete webhooks not in table
    test('Verify cannot delete webhooks not in table', async () => {
        await webhookDb.ensureWebhookNotExists(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
        const response: APIResponse = await webhookApi.removeWebhook(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);

        expect(response.status()).toBe(404);
        await webhookDb.assertWebhookDoesNotExist(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
    });
});
