import { HttpException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebhooksService } from "./webhooks.service.js";

const URL = "https://discord.com/api/webhooks/1053664698949697586/Bq8WVRf-m2giLxFUX2-qRxc7lMyS9LXtiRXp9EmNS4UP8MsL4Z20lkfJianG8yZJMis4";

function setup() {
  const query = vi.fn();
  const pool = { query } as any;
  const discord = {
    getFromWebhook: vi.fn(),
    sendToDiscordWebhook: vi.fn(),
  } as any;
  const service = new WebhooksService(pool, discord);
  return { service, query, discord };
}

async function capture(promise: Promise<unknown>): Promise<any> {
  try {
    await promise;
    throw new Error("expected rejection");
  } catch (err) {
    return err;
  }
}

describe("WebhooksService", () => {
  describe("create", () => {
    it("adds a new webhook", async () => {
      const { service, query, discord } = setup();
      discord.getFromWebhook.mockResolvedValue({});
      query.mockResolvedValueOnce({ rows: [{ count: "0" }] }).mockResolvedValueOnce({});

      const result = await service.create(URL);

      expect(result).toEqual({ message: "Webhook added successfully!" });
      expect(query).toHaveBeenNthCalledWith(
        1,
        "SELECT COUNT(*) FROM webhooks WHERE webhook_url = $1",
        [URL],
      );
      expect(query).toHaveBeenNthCalledWith(
        2,
        "INSERT INTO webhooks (webhook_url, created_at) VALUES ($1, NOW())",
        [URL],
      );
      expect(discord.sendToDiscordWebhook).toHaveBeenCalledWith(URL, {
        content: "Tracking added successfully!",
      });
    });

    it("rejects when the Discord GET fails", async () => {
      const { service, discord } = setup();
      discord.getFromWebhook.mockRejectedValue(new Error("nope"));

      const err = await capture(service.create(URL));

      expect(err).toBeInstanceOf(HttpException);
      expect(err.getStatus()).toBe(400);
      expect(err.getResponse()).toEqual({ message: "Failed to GET webhook" });
    });

    it("rejects duplicates", async () => {
      const { service, query, discord } = setup();
      discord.getFromWebhook.mockResolvedValue({});
      query.mockResolvedValueOnce({ rows: [{ count: "3" }] });

      const err = await capture(service.create(URL));

      expect(err.getStatus()).toBe(400);
      expect(err.getResponse()).toEqual({ error: "Webhook already exists" });
      expect(discord.sendToDiscordWebhook).not.toHaveBeenCalled();
    });

    it("returns 500 on insert failure", async () => {
      const { service, query, discord } = setup();
      discord.getFromWebhook.mockResolvedValue({});
      query.mockResolvedValueOnce({ rows: [{ count: "0" }] }).mockRejectedValueOnce(new Error("db down"));

      const err = await capture(service.create(URL));

      expect(err.getStatus()).toBe(500);
      expect(err.getResponse()).toEqual({ error: "Error inserting webhook to DB" });
    });
  });

  describe("remove", () => {
    it("deletes an existing webhook", async () => {
      const { service, query } = setup();
      query.mockResolvedValue({ rowCount: 1 });

      const result = await service.remove(URL);

      expect(result).toEqual({ message: "Webhook deleted successfully" });
      expect(query).toHaveBeenCalledWith("DELETE FROM webhooks WHERE webhook_url = $1", [URL]);
    });

    it("returns 404 for a missing webhook", async () => {
      const { service, query } = setup();
      query.mockResolvedValue({ rowCount: 0 });

      const err = await capture(service.remove(URL));

      expect(err.getStatus()).toBe(404);
      expect(err.getResponse()).toEqual({ error: "Webhook not found" });
    });

    it("returns 500 on delete failure", async () => {
      const { service, query } = setup();
      query.mockRejectedValue(new Error("db down"));

      const err = await capture(service.remove(URL));

      expect(err.getStatus()).toBe(500);
      expect(err.getResponse()).toEqual({ error: "Error deleting webhook" });
    });
  });
});
