import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WebhookClient } from "discord.js";
import { Repository } from "typeorm";
import { Webhook } from "../db/entities/webhook.entity.js";

const DISCORD_WEBHOOK_PATH = /^\/api\/webhooks\/\d{17,19}\/\S+$/;

function assertDiscordWebhookUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid Discord webhook URL");
  }
  if (
    parsed.protocol !== "https:" ||
    (parsed.hostname !== "discord.com" && parsed.hostname !== "discordapp.com") ||
    !DISCORD_WEBHOOK_PATH.test(parsed.pathname)
  ) {
    throw new Error("URL is not an allowed Discord webhook");
  }
}

@Injectable()
export class DiscordService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhooks: Repository<Webhook>,
  ) {}

  async getFromWebhook(url: string): Promise<Response> {
    try {
      assertDiscordWebhookUrl(url);
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch data from URL. Status: ${response.status}`);
      }
      return response;
    } catch (err) {
      console.error("Error making GET request:", err);
      throw err;
    }
  }

  async sendToDiscordWebhook(url: string, payload: any): Promise<void> {
    assertDiscordWebhookUrl(url);
    await new WebhookClient({ url }).send(payload);
  }

  async sendToDiscordWebhookBulk(hookUrls: string[], payload: any): Promise<void> {
    try {
      await Promise.all(
        hookUrls.map((url) => this.sendToDiscordWebhook(url, payload).catch(console.error)),
      );
      console.log("Messages sent to Discord webhooks");
    } catch (err) {
      console.error("Error sending messages to Discord webhooks:", err);
    }
  }

  async sendToDiscordWebhooksInDb(payload: any): Promise<void> {
    try {
      const rows = await this.webhooks.find({ select: { webhookUrl: true } });
      const hookUrls = rows.map((row) => row.webhookUrl);
      await this.sendToDiscordWebhookBulk(hookUrls, payload);
    } catch (err) {
      console.error("Error sending messages to Discord webhooks from DB:", err);
    }
  }
}
