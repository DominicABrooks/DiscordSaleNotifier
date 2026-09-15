import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as fc from "fast-check";
import "reflect-metadata";

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 250);
const FUZZ_SEED = Number(process.env.FUZZ_SEED ?? 0);
const fcOpts = { numRuns: FUZZ_RUNS, ...(FUZZ_SEED ? { seed: FUZZ_SEED } : {}) };
import request from "supertest";
import { DataSource } from "typeorm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../app.module.js";
import { Sale } from "../db/entities/sale.entity.js";
import { Webhook } from "../db/entities/webhook.entity.js";
import { DiscordService } from "../discord/discord.service.js";

process.env.STEAM_CRON = "off";

const webhookArb = fc.oneof(
  fc.string({ maxLength: 300 }),
  fc.integer(),
  fc.boolean(),
  fc.constant(null),
);
const bodyArb = fc.record({ webhook: webhookArb }, { requiredKeys: [] });

let app: INestApplication;

beforeAll(async () => {
  const webhooksRepo = {
    create: (dto: any) => dto,
    findOneBy: vi.fn(async () => null),
    save: vi.fn(async () => ({})),
    delete: vi.fn(async () => ({ affected: 0 })),
    find: vi.fn(async () => []),
  };
  const salesRepo = {
    create: (dto: any) => dto,
    find: vi.fn(async () => []),
    save: vi.fn(async () => ({})),
    delete: vi.fn(async () => ({ affected: 0 })),
  };
  const discord = {
    getFromWebhook: vi.fn(async () => ({})),
    sendToDiscordWebhook: vi.fn(async () => undefined),
    sendToDiscordWebhookBulk: vi.fn(async () => undefined),
    sendToDiscordWebhooksInDb: vi.fn(async () => undefined),
  };

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DataSource)
    .useValue({})
    .overrideProvider(getRepositoryToken(Webhook))
    .useValue(webhooksRepo)
    .overrideProvider(getRepositoryToken(Sale))
    .useValue(salesRepo)
    .overrideProvider(DiscordService)
    .useValue(discord)
    .compile();
  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();
});

afterAll(async () => {
  await app?.close();
});

describe("webhook API fuzz", () => {
  it("POST /api/webhook/create never 500s and always answers JSON", async () => {
    await fc.assert(
      fc.asyncProperty(bodyArb, async (body) => {
        const res = await request(app.getHttpServer())
          .post("/api/webhook/create")
          .send(body)
          .set("Content-Type", "application/json");
        expect([200, 400]).toContain(res.status);
        expect(res.headers["content-type"]).toMatch(/json/);
        if (res.status === 400) {
          expect(res.body.error ?? res.body.message).toBeDefined();
        } else {
          expect(res.body).toEqual({ message: "Webhook added successfully!" });
        }
      }),
      fcOpts,
    );
  });

  it("DELETE /api/webhook/delete never 500s and always answers JSON", async () => {
    await fc.assert(
      fc.asyncProperty(bodyArb, async (body) => {
        const res = await request(app.getHttpServer())
          .delete("/api/webhook/delete")
          .send(body)
          .set("Content-Type", "application/json");
        expect([200, 400, 404]).toContain(res.status);
        expect(res.headers["content-type"]).toMatch(/json/);
        if (res.status !== 200) {
          expect(res.body.error ?? res.body.message).toBeDefined();
        }
      }),
      fcOpts,
    );
  });
});
