import { test, Page, expect, APIResponse } from '@playwright/test';
import WebhookDbPage from '../pages/db/webhook-db.page';
import WebhookApiPage from '../pages/api/webhook-api';
import config from '../config/config';
import ReactApiPage from '../pages/api/react-api';

const webhookApi = new WebhookApiPage();
const webhookDb = new WebhookDbPage();
webhookApi.init();

test.describe('API Webhook Creation & Deletion Tests', () => {
    // Annotate as serial.
    test.describe.configure({ mode: 'serial' });

    test('Verify adding webhook tracking', async () => {
        const response: APIResponse = await webhookApi.addWebhook(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
        
        expect(response.ok()).toBeTruthy();
        await webhookDb.assertWebhookExists(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
    });

    //Verify cannot add duplicate webhooks
    test('Verify cannot add duplicate webhooks', async () => {
        const response: APIResponse = await webhookApi.addWebhook(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);

        expect(response.status()).toBe(400);
        await webhookDb.assertWebhookExists(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
    });

    // Verify can delete webhook
    test('Verify can delete webhook', async () => {
        const response: APIResponse = await webhookApi.removeWebhook(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);

        expect(response.ok()).toBeTruthy();
        await webhookDb.assertWebhookDoesNotExist(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
    });

    // Verify cannot delete webhooks not in table
    test('Verify cannot delete webhooks not in table', async () => {
        const response: APIResponse = await webhookApi.removeWebhook(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);

        expect(response.status()).toBe(404);
        await webhookDb.assertWebhookDoesNotExist(config.DISCORD_WEBHOOK_URL_FOR_API_TESTS);
    });
});

test.describe('Webhook API Validation Tests', () => {
    const INVALID_DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1138273465242239148/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
    const NOT_DISCORD_WEBHOOK_URL = "https://discord.com";

    // Add negative API cases
    test('Verify cannot POST Non-Discord Webhook URL', async () => {
        const response: APIResponse = await webhookApi.addWebhook(NOT_DISCORD_WEBHOOK_URL);
        
        expect(response.status()).toBe(400);
        await webhookDb.assertWebhookDoesNotExist(NOT_DISCORD_WEBHOOK_URL);
    });

    test('Verify cannot POST empty Discord Webhook URL', async () => {
        const response: APIResponse = await webhookApi.addWebhook("");
        
        expect(response.status()).toBe(400);
        await webhookDb.assertWebhookDoesNotExist("");
    });

    test('Verify cannot POST invalid Discord Webhook URL', async () => {
        const response: APIResponse = await webhookApi.addWebhook(INVALID_DISCORD_WEBHOOK_URL);
        
        expect(response.status()).toBe(400);
        await webhookDb.assertWebhookDoesNotExist(INVALID_DISCORD_WEBHOOK_URL);
    });

    // Delete negative API cases
    test('Verify cannot DELETE Non-Discord Webhook URL', async () => {
        const response: APIResponse = await webhookApi.removeWebhook(NOT_DISCORD_WEBHOOK_URL);
        
        expect(response.status()).toBe(400);
        await webhookDb.assertWebhookDoesNotExist(NOT_DISCORD_WEBHOOK_URL);
    });

    test('Verify cannot DELETE Empty Webhook URL', async () => {
        const response: APIResponse = await webhookApi.removeWebhook("");
        
        expect(response.status()).toBe(400);
        await webhookDb.assertWebhookDoesNotExist("");
    });
});

test.describe('Can Retrieve From React API Endpoints', () => {
    let page: any;
    let reactApi;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        reactApi = new ReactApiPage(page);
    });
    
    test.afterEach(async () => {
        await page.close();
    });

    test('Verify can get FavIcon', async () => {
        const response: APIResponse = await reactApi.getFavIcon();
        
        expect(response.ok()).toBeTruthy();
    });

    test('Verify can get Discord SVG', async () => {
        const response: APIResponse = await reactApi.getDiscordSvg();
        
        expect(response.ok()).toBeTruthy();
    });

    test('Verify can get Logo', async () => {
        const response: APIResponse = await reactApi.getLogo();
        
        expect(response.ok()).toBeTruthy();
    });
});