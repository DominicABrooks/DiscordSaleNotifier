import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Webhook } from "../db/entities/webhook.entity.js";
import { DiscordService } from "./discord.service.js";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Webhook])],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
