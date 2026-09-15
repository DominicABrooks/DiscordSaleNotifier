import { NestFactory } from "@nestjs/core";
import { AppModule } from "./dist/src/app.module.js";
import { SteamService } from "./dist/src/steam/steam.service.js";

const ctx = await NestFactory.createApplicationContext(AppModule, { logger: ["log", "error", "warn"] });
try {
  await ctx.get(SteamService).checkSteamSpecials();
  console.log("BATCH DONE");
} finally {
  await ctx.close();
}
process.exit(0);
