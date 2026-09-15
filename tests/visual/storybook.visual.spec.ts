import { expect, test } from "@playwright/test";

const BASE_URL = "http://127.0.0.1:6006";

const STORIES = [
  { id: "app--default", name: "App default" },
  { id: "components-cardtabs--default", name: "CardTabs default" },
  { id: "components-header--default", name: "Header default" },
  { id: "components-footer--default", name: "Footer default" },
  { id: "components-trackingform--add-mode", name: "TrackingForm add mode" },
  { id: "components-trackingform--delete-mode", name: "TrackingForm delete mode" },
  { id: "components-addtrackingform--default", name: "AddTrackingForm default" },
  { id: "components-deletetrackingform--default", name: "DeleteTrackingForm default" }
];

for (const story of STORIES) {
  test("storybook visual " + story.name, async function ({ page }) {
    await page.goto(BASE_URL + "/iframe.html?id=" + story.id, { waitUntil: "networkidle" });
    await expect(page.locator("#storybook-root")).toBeVisible();
    await page.screenshot({ path: "storybook-screenshots/" + story.id + ".png" });
  });
}
