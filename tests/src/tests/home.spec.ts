import { test, expect, Page } from '@playwright/test';
import HomePage from '../pages/public/home.page';
import WebhookDbPage from '../pages/db/webhook-db.page';
import config from '../config/config';
import assert from 'assert';

test.describe('Home Page Static Elements Tests', () => {
  let page: Page;
  let homePage: HomePage;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.afterEach(async () => {
    await page.close();
  });

  // Verify static elements
  // -----------------------
  test('Verify static header Elements', async () => {
    await homePage.assertLogoImageVisible(); 
    await homePage.assertHeaderText("Steam Sale Notifier");
    await homePage.assertSubheadingText("Stay updated with Discord notifications for new Steam sales!");
  });

  test('Verify static card elements', async () => {
    await homePage.assertSupportPlatformListVisible(); 
  });

  test('Verify static footer elements', async () => {
    await homePage.assertCopyRightNoticeText("© 2024 Steam Sale Notifier");
  });

  test('Verify page title', async () => {
    await homePage.assertPageTitleText("Discord Steam Sale Notifier");
  });

  // Links work
  // -----------------------
  test('Verify functionality of "Intro to Webhooks" article link', async () => {
    // Get browser context
    const context = page.context();

    // Start waiting for new page before clicking
    const pagePromise = context.waitForEvent('page');

    // Click webhook article (?), to open support in new tab
    await homePage.clickWebhookArticleLink();

    // Wait for new page to finish loading
    const newPage = await pagePromise;
    await newPage.waitForURL("https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks");
  });

  test('Verify Discord icon link', async () => {
    await homePage.clickDiscordIcon();
    await page.waitForURL("https://discord.com");
  });
});

test.describe('Webhook Creation & Deletion Tests', () => {
  // Annotate entire file as serial.
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
    await homePage.fillWebhookTextbox(config.DISCORD_WEBHOOK_URL);
    await homePage.clickStartTrackingButton();
    await homePage.assertToastContainerText("Webhook added successfully!");
    await webhookDb.assertWebhookExists(config.DISCORD_WEBHOOK_URL);
  });

  test('Verify cannot add duplicate webhooks', async () => {
    await homePage.fillWebhookTextbox(config.DISCORD_WEBHOOK_URL);
    await homePage.clickStartTrackingButton();
    await homePage.assertToastContainerText("Webhook already exists");
    await webhookDb.assertWebhookExists(config.DISCORD_WEBHOOK_URL);
  });

  test('Verify can delete webhook', async () => {
    await homePage.clickDeleteTrackingTab();
    await homePage.fillWebhookTextbox(config.DISCORD_WEBHOOK_URL);
    await homePage.clickDeleteTrackingButton();
    await homePage.assertToastContainerText("Webhook deleted successfully!");
    await webhookDb.assertWebhookDoesNotExist(config.DISCORD_WEBHOOK_URL);
  });

  test('Verify cannot delete webhooks not in table', async () => {
    await homePage.clickDeleteTrackingTab();
    await homePage.fillWebhookTextbox(config.DISCORD_WEBHOOK_URL);
    await homePage.clickDeleteTrackingButton();
    await homePage.assertToastContainerText("Webhook not found");
    await webhookDb.assertWebhookDoesNotExist(config.DISCORD_WEBHOOK_URL);
  });
});

test.describe('Webhook Client Validation Tests', () => {
  const INVALID_DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1138273465242239148/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
  const NOT_DISCORD_WEBHOOK_URL = "https://discord.com";

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

  // Add negative client cases
  test('Verify cannot input Non-Discord Webhook URL', async () => {
    await homePage.fillWebhookTextbox(NOT_DISCORD_WEBHOOK_URL);
    await homePage.clickStartTrackingButton();
    await homePage.assertToastContainerText("Invalid Webhook");
    await homePage.assertValidationErrorsText("Please provide a valid Discord Webhook URL.");
    await webhookDb.assertWebhookDoesNotExist(NOT_DISCORD_WEBHOOK_URL);
  });

  test('Verify cannot input empty Discord Webhook URL', async () => {

    await homePage.fillWebhookTextbox("");
    await homePage.clickStartTrackingButton();
    await homePage.assertToastContainerText("Invalid Webhook");
    await homePage.assertValidationErrorsText("Please provide a valid Discord Webhook URL.");
    await webhookDb.assertWebhookDoesNotExist("");
  });

  test('Verify cannot input invalid Discord Webhook URL', async () => {

    await homePage.fillWebhookTextbox(INVALID_DISCORD_WEBHOOK_URL);
    await homePage.clickStartTrackingButton();
    await homePage.assertToastContainerText("Failed to fetch webhook URL");
    await webhookDb.assertWebhookDoesNotExist(INVALID_DISCORD_WEBHOOK_URL);
  });

  // Delete negative client cases
  test('Verify cannot delete Non-Discord Webhook URL', async () => {
    await homePage.clickDeleteTrackingTab();
    await homePage.fillWebhookTextbox(NOT_DISCORD_WEBHOOK_URL);
    await homePage.clickDeleteTrackingButton();
    await homePage.assertToastContainerText("Invalid Webhook");
    await webhookDb.assertWebhookDoesNotExist(NOT_DISCORD_WEBHOOK_URL);
  });

  
  test('Verify cannot delete empty Discord Webhook URL', async () => {
    await homePage.clickDeleteTrackingTab();
    await homePage.fillWebhookTextbox("");
    await homePage.clickDeleteTrackingButton();
    await homePage.assertToastContainerText("Invalid Webhook");
    await homePage.assertValidationErrorsText("Please provide a valid Discord Webhook URL.");
    await webhookDb.assertWebhookDoesNotExist("");
  });
});