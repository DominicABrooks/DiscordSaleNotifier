import { Global, Module } from "@nestjs/common";
import { DiscordService } from "./discord.service.js";

@Global()
@Module({
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
