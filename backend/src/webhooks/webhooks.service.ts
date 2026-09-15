import { HttpException, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Webhook } from "../db/entities/webhook.entity.js";
import { DiscordService } from "../discord/discord.service.js";

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook)
    private readonly webhooks: Repository<Webhook>,
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
      const existing = await this.webhooks.findOneBy({ webhookUrl: webhook });
      if (existing) {
        throw new HttpException({ error: "Webhook already exists" }, 400);
      }

      await this.webhooks.save(this.webhooks.create({ webhookUrl: webhook }));

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
      const result = await this.webhooks.delete({ webhookUrl: webhook });

      if (result.affected && result.affected > 0) {
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
