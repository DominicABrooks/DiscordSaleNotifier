import { test, Page } from '@playwright/test';
import HomePage from '../pages/public/home.page';
import WebhookDbPage from '../pages/db/webhook-db.page';
import config from '../config/config';

test.describe('Webhook Creation & Deletion Tests', () => {
  // Annotate as serial.
  test.describe.configure({ mode: 'serial' });

  let page: any;
  let homePage: HomePage;
  let webhookDb: WebhookDbPage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    homePage = new HomePage(page);
    webhookDb = new WebhookDbPage();
    await homePage.goto();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Verify adding webhook tracking', async () => {
    await webhookDb.ensureWebhookNotExists(config.DISCORD_WEBHOOK_URL);
    await homePage.fillWebhookTextbox(config.DISCORD_WEBHOOK_URL);
    await homePage.clickStartTrackingButton();
    await homePage.assertToastContainerText("Webhook added successfully!");
    await webhookDb.assertWebhookExists(config.DISCORD_WEBHOOK_URL);
  });

  test('Verify cannot add duplicate webhooks', async () => {
    await webhookDb.ensureWebhookExists(config.DISCORD_WEBHOOK_URL);
    await homePage.fillWebhookTextbox(config.DISCORD_WEBHOOK_URL);
    await homePage.clickStartTrackingButton();
    await homePage.assertToastContainerText("Webhook already exists");
    await webhookDb.assertWebhookExists(config.DISCORD_WEBHOOK_URL);
  });

  test('Verify can delete webhook', async () => {
    await webhookDb.ensureWebhookExists(config.DISCORD_WEBHOOK_URL);
    await homePage.clickDeleteTrackingTab();
    await homePage.fillWebhookTextbox(config.DISCORD_WEBHOOK_URL);
    await homePage.clickDeleteTrackingButton();
    await homePage.assertToastContainerText("Webhook deleted successfully!");
    await webhookDb.assertWebhookDoesNotExist(config.DISCORD_WEBHOOK_URL);
  });

  test('Verify cannot delete webhooks not in table', async () => {
    await webhookDb.ensureWebhookNotExists(config.DISCORD_WEBHOOK_URL);
    await homePage.clickDeleteTrackingTab();
    await homePage.fillWebhookTextbox(config.DISCORD_WEBHOOK_URL);
    await homePage.clickDeleteTrackingButton();
    await homePage.assertToastContainerText("Webhook not found");
    await webhookDb.assertWebhookDoesNotExist(config.DISCORD_WEBHOOK_URL);
  });
});
