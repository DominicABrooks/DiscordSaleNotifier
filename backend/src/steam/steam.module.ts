import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sale } from "../db/entities/sale.entity.js";
import { SteamService } from "./steam.service.js";

@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  providers: [SteamService],
  exports: [SteamService],
})
export class SteamModule {}
