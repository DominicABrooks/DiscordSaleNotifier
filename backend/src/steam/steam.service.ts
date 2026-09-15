import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import type { Pool } from "pg";
import { PG_POOL } from "../db/db.module.js";
import { DiscordService } from "../discord/discord.service.js";
import { formatSpecial } from "./format-special.js";

@Injectable()
export class SteamService implements OnModuleInit {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    @Inject(DiscordService) private readonly discord: DiscordService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SchedulerRegistry) private readonly scheduler: SchedulerRegistry,
  ) {}

  onModuleInit() {
    const expression = this.config.get<string>("STEAM_CRON", "* * * * *");
    if (!expression || expression === "off") {
      console.log("Steamworks cron disabled (STEAM_CRON=off).");
      return;
    }
    const job = new CronJob(expression, () => void this.checkSteamSpecials());
    this.scheduler.addCronJob("steamworks", job);
    job.start();
    console.log(`Steamworks cron scheduled: ${expression}`);
  }

  async checkSteamSpecials(): Promise<void> {
    console.log("Running cron job...");
    try {
      await this.pool.query("DELETE FROM sales WHERE expiration_date < NOW()");

      let existingSales: string[];
      try {
        const result = await this.pool.query("SELECT game_id FROM sales");
        existingSales = result.rows.map((row: any) => row.game_id);
      } catch (error) {
        console.error("Error retrieving game IDs from sales table:", error);
        throw error;
      }

      const steamData = await this.fetchDataFromSteamworks();
      for (const special of steamData) {
        const specialId = special.id.toString();
        if (!existingSales.includes(specialId)) {
          const expirationTimestamp = new Date(special.discount_expiration * 1000).toISOString();
          await this.pool.query(
            "INSERT INTO sales (game_id, expiration_date) VALUES ($1, $2)",
            [special.id, expirationTimestamp],
          );
          console.log(`Added sale to database: ID ${special.id}, Expiration ${expirationTimestamp}`);
          await this.discord.sendToDiscordWebhooksInDb(formatSpecial(special));
        }
      }
    } catch (error) {
      console.error("Error in cron job:", error);
    }
  }

  private async fetchDataFromSteamworks(): Promise<any[]> {
    const url = "https://store.steampowered.com/api/featuredcategories?cc=US";
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch data from Steamworks API. Status: ${response.status}`);
      }
      const data = await response.json();
      return data.specials.items;
    } catch (error) {
      console.error("Error fetching data from Steamworks API:", error);
      return [];
    }
  }
}
