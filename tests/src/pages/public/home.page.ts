import { expect, type Locator, type Page } from '@playwright/test';

export default class HomePage {
  readonly page: Page;

  // Header items
  readonly logoImage: Locator;
  readonly headerText: Locator;
  readonly subheadingText: Locator;

  // Card items
  readonly addTrackingTab: Locator;
  readonly deleteTrackingTab: Locator;

  readonly webhookUrlTextbox: Locator;
  readonly webhookArticleLink: Locator;

  readonly supportPlatformList: Locator;

  readonly validationErrorsText: Locator;

  readonly startTrackingButton: Locator;
  readonly deleteTrackingButton: Locator;

  // Footer items
  readonly copyRightNoticeText: Locator;
  readonly discordIcon: Locator;

  // Alerts
  readonly toastContainer: Locator;
  readonly failedToFetchToast: Locator;

  constructor(page: Page) {
    this.page = page;
  
    // Header items
    this.logoImage = page.getByRole('img', { name: 'Logo' });
    this.headerText = page.getByRole('heading', { name: 'Steam Sale Notifier' });
    this.subheadingText = page.getByText('Stay updated with Discord');

    // Card items
    this.addTrackingTab = page.getByRole('tab', { name: 'Add Tracking' })
    this.deleteTrackingTab = page.getByRole('tab', { name: 'Delete Tracking' })
    this.webhookUrlTextbox = page.getByRole('textbox', { name: 'Webhook URL (?)' })
    this.webhookArticleLink = page.getByRole('link', { name: '(?)' })
    this.supportPlatformList = page.getByLabel('Add Tracking').getByText('Platforms currently supported:')
    this.validationErrorsText = page.getByLabel('Add Tracking').getByText('Please provide a valid')
    this.startTrackingButton = page.getByRole('button', { name: 'Start Tracking!' })
    this.deleteTrackingButton = page.getByRole('button', { name: 'Remove Tracking!' })

    // Footer items
    this.copyRightNoticeText = page.getByText('© 2024 Steam Sale Notifier');
    this.discordIcon = page.getByRole('link', { name: 'Discord' });

    // Alerts
    this.toastContainer = page.getByRole('alert');
  }

  // Navigate to Home Page
  async goto() {
    await this.page.goto('/');
  }

  // Fill textbox methods
  async fillWebhookTextbox(webhook: string) {
    await this.webhookUrlTextbox.fill(webhook);
  }

  // Assert visibility methods
  async assertLogoImageVisible() {
    await expect(this.logoImage).toBeVisible();
  }

  async assertSupportPlatformListVisible() {
    await expect(this.supportPlatformList).toBeVisible();
  }

  // Assert text matches methods
  async assertHeaderText(expectedText: string) {
    const actualText = await this.headerText.innerText();
    expect(actualText).toBe(expectedText);
  }

  async assertSubheadingText(expectedText: string) {
    const actualText = await this.subheadingText.innerText();
    expect(actualText).toBe(expectedText);
  }
  
  async assertValidationErrorsText(expectedText: string) {
    const actualText = await this.validationErrorsText.innerText();
    expect(actualText).toBe(expectedText);
  }

  async assertCopyRightNoticeText(expectedText: string) {
    const actualText = await this.copyRightNoticeText.innerText();
    expect(actualText).toBe(expectedText);
  }

  async assertToastContainerText(expectedText: string) {
    const actualText = await this.toastContainer.innerText();
    expect(actualText).toBe(expectedText); 
  }

  async assertPageTitleText(expectedText: string) {
    const actualText = await this.page.title();
    expect(actualText).toBe(expectedText);
  }

  // Click methods
  async clickAddTrackingTab() {
    await this.addTrackingTab.click();
  }

  async clickDeleteTrackingTab() {
    await this.deleteTrackingTab.click();
  }

  async clickWebhookArticleLink() {
    await this.webhookArticleLink.click();
  }

  async clickStartTrackingButton() {
    await this.startTrackingButton.click();
  }

  async clickDeleteTrackingButton() {
    await this.deleteTrackingButton.click();
  }

  async clickDiscordIcon() {
    await this.discordIcon.click();
  }
}