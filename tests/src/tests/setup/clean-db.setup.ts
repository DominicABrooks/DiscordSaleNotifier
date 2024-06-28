import { test as setup, Page, expect, APIResponse } from '@playwright/test';
import WebhookApiPage from '../../pages/api/webhook-api';
import WebhookDbPage from '../../pages/db/webhook-db.page';
import config from '../../config/config';

const webhookDb = new WebhookDbPage();

setup('Clear webhooks table', async () => {
    await webhookDb.clearTable();
});