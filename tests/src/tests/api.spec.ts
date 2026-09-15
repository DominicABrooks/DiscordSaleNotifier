import { test, Page, expect, APIResponse } from '@playwright/test';
import WebhookDbPage from '../pages/db/webhook-db.page';
import WebhookApiPage from '../pages/api/webhook-api';
import config from '../config/config';
import ReactApiPage from '../pages/api/react-api';

const webhookApi = new WebhookApiPage();
const webhookDb = new WebhookDbPage();
test.beforeAll(async () => {
  await webhookApi.init();
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
    let reactApi: ReactApiPage;

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