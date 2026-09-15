import { Module } from "@nestjs/common";
import { SteamService } from "./steam.service.js";

@Module({
  providers: [SteamService],
  exports: [SteamService],
})
export class SteamModule {}
