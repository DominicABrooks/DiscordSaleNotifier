import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DbModule } from './db/db.module.js';
import { DiscordModule } from './discord/discord.module.js';
import { HealthController } from './health/health.controller.js';
import { SteamModule } from './steam/steam.module.js';
import { WebhooksModule } from './webhooks/webhooks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    ScheduleModule.forRoot(),
    DbModule,
    DiscordModule,
    SteamModule,
    WebhooksModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
