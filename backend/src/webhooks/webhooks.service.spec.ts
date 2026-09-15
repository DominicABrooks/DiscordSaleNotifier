import { HttpException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WebhooksService } from "./webhooks.service.js";

const URL = "https://discord.com/api/webhooks/1053664698949697586/Bq8WVRf-m2giLxFUX2-qRxc7lMyS9LXtiRXp9EmNS4UP8MsL4Z20lkfJianG8yZJMis4";

function setup() {
  const webhooks = {
    create: vi.fn((dto: any) => dto),
    findOneBy: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  };
  const discord = {
    getFromWebhook: vi.fn(),
    sendToDiscordWebhook: vi.fn(),
  } as any;
  const service = new WebhooksService(webhooks as any, discord);
  return { service, webhooks, discord };
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
      const { service, webhooks, discord } = setup();
      discord.getFromWebhook.mockResolvedValue({});
      webhooks.findOneBy.mockResolvedValue(null);
      webhooks.save.mockResolvedValue({});

      const result = await service.create(URL);

      expect(result).toEqual({ message: "Webhook added successfully!" });
      expect(webhooks.findOneBy).toHaveBeenCalledWith({ webhookUrl: URL });
      expect(webhooks.create).toHaveBeenCalledWith({ webhookUrl: URL });
      expect(webhooks.save).toHaveBeenCalledTimes(1);
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
      const { service, webhooks, discord } = setup();
      discord.getFromWebhook.mockResolvedValue({});
      webhooks.findOneBy.mockResolvedValue({ webhookUrl: URL });

      const err = await capture(service.create(URL));

      expect(err.getStatus()).toBe(400);
      expect(err.getResponse()).toEqual({ error: "Webhook already exists" });
      expect(webhooks.save).not.toHaveBeenCalled();
      expect(discord.sendToDiscordWebhook).not.toHaveBeenCalled();
    });

    it("returns 500 on insert failure", async () => {
      const { service, webhooks, discord } = setup();
      discord.getFromWebhook.mockResolvedValue({});
      webhooks.findOneBy.mockResolvedValue(null);
      webhooks.save.mockRejectedValue(new Error("db down"));

      const err = await capture(service.create(URL));

      expect(err.getStatus()).toBe(500);
      expect(err.getResponse()).toEqual({ error: "Error inserting webhook to DB" });
    });
  });

  describe("remove", () => {
    it("deletes an existing webhook", async () => {
      const { service, webhooks } = setup();
      webhooks.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(URL);

      expect(result).toEqual({ message: "Webhook deleted successfully" });
      expect(webhooks.delete).toHaveBeenCalledWith({ webhookUrl: URL });
    });

    it("returns 404 for a missing webhook", async () => {
      const { service, webhooks } = setup();
      webhooks.delete.mockResolvedValue({ affected: 0 });

      const err = await capture(service.remove(URL));

      expect(err.getStatus()).toBe(404);
      expect(err.getResponse()).toEqual({ error: "Webhook not found" });
    });

    it("returns 500 on delete failure", async () => {
      const { service, webhooks } = setup();
      webhooks.delete.mockRejectedValue(new Error("db down"));

      const err = await capture(service.remove(URL));

      expect(err.getStatus()).toBe(500);
      expect(err.getResponse()).toEqual({ error: "Error deleting webhook" });
    });
  });
});
