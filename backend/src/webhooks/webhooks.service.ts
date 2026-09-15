import { HttpException, Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../db/db.module.js";
import { DiscordService } from "../discord/discord.service.js";

@Injectable()
export class WebhooksService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(DiscordService) private readonly discord: DiscordService,
  ) {}

  async create(webhook: string): Promise<{ message: string }> {
    try {
      await this.discord.getFromWebhook(webhook);
    } catch (err) {
      console.error("Failed to fetch webhook: ", err);
      throw new HttpException({ message: "Failed to GET webhook" }, 400);
    }

    try {
      const { rows } = await this.pool.query(
        "SELECT COUNT(*) FROM webhooks WHERE webhook_url = $1",
        [webhook],
      );
      if (parseInt(rows[0].count) > 0) {
        throw new HttpException({ error: "Webhook already exists" }, 400);
      }

      await this.pool.query(
        "INSERT INTO webhooks (webhook_url, created_at) VALUES ($1, NOW())",
        [webhook],
      );

      await this.discord.sendToDiscordWebhook(webhook, {
        content: "Tracking added successfully!",
      });

      return { message: "Webhook added successfully!" };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error inserting webhook:", err);
      throw new HttpException({ error: "Error inserting webhook to DB" }, 500);
    }
  }

  async remove(webhook: string): Promise<{ message: string }> {
    try {
      const result = await this.pool.query(
        "DELETE FROM webhooks WHERE webhook_url = $1",
        [webhook],
      );

      if (result.rowCount && result.rowCount > 0) {
        return { message: "Webhook deleted successfully" };
      }
      throw new HttpException({ error: "Webhook not found" }, 404);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error deleting webhook:", err);
      throw new HttpException({ error: "Error deleting webhook" }, 500);
    }
  }
}
