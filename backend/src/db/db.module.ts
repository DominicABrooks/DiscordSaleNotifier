import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sale } from "./entities/sale.entity.js";
import { Webhook } from "./entities/webhook.entity.js";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("DB_HOST", "localhost"),
        port: Number(config.get<string>("DB_PORT", "5432")),
        username: config.get<string>("DB_USER", "postgres"),
        password: config.get<string>("DB_PASS", "postgres"),
        database: config.get<string>("DB_NAME", "discord_sale_notifier"),
        entities: [Webhook, Sale],
        synchronize: true,
      }),
    }),
  ],
})
export class DbModule {}
