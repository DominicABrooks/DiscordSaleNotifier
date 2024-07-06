import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright'; 
import HomePage from '../pages/public/home.page';
import { createHtmlReport } from 'axe-html-reporter';

const reportDir = "tests/build/reports";

test('Accessibility Tests', async ({ page }) => {
    await new HomePage(page).goto();

    const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(['color-contrast']) // Disable false positive color-contrast rule
    .analyze();

    createHtmlReport({
        results: accessibilityScanResults,
        options: {
            projectKey: "Home Page",
            outputDir: reportDir
        },
    });

    expect(accessibilityScanResults.violations).toEqual([]);
});
