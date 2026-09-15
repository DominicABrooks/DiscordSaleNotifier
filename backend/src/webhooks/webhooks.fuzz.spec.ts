import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as fc from "fast-check";
import "reflect-metadata";

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 250);
const FUZZ_SEED = Number(process.env.FUZZ_SEED ?? 0);
const fcOpts = { numRuns: FUZZ_RUNS, ...(FUZZ_SEED ? { seed: FUZZ_SEED } : {}) };
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "../app.module.js";
import { PG_POOL } from "../db/db.module.js";
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
let query: ReturnType<typeof vi.fn>;

beforeAll(async () => {
  query = vi.fn(async (sql: string) => {
    if (sql.startsWith("SELECT COUNT")) return { rows: [{ count: "0" }] };
    if (sql.startsWith("DELETE")) return { rowCount: 0 };
    return {};
  });
  const discord = {
    getFromWebhook: vi.fn(async () => ({})),
    sendToDiscordWebhook: vi.fn(async () => undefined),
    sendToDiscordWebhookBulk: vi.fn(async () => undefined),
    sendToDiscordWebhooksInDb: vi.fn(async () => undefined),
  };

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PG_POOL)
    .useValue({ query })
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
