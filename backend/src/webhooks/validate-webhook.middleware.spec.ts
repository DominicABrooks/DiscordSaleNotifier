import { describe, expect, it, vi } from "vitest";
import { ValidateWebhookMiddleware } from "./validate-webhook.middleware.js";

const VALID = "https://discord.com/api/webhooks/1053664698949697586/Bq8WVRf-m2giLxFUX2-qRxc7lMyS9LXtiRXp9EmNS4UP8MsL4Z20lkfJianG8yZJMis4";

function setup(webhook: string) {
  const middleware = new ValidateWebhookMiddleware();
  const req = { body: { webhook } } as any;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status } as any;
  const next = vi.fn();
  return { middleware, req, res, json, status, next };
}

describe("ValidateWebhookMiddleware", () => {
  it("rejects a non-URL", () => {
    const { middleware, req, res, json, status, next } = setup("not a url");

    middleware.use(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Input Webhook is not URL" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a non-Discord URL", () => {
    const { middleware, req, res, json, status, next } = setup("https://discord.com");

    middleware.use(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Input Webhook is not a Discord Webhook URL" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a URL without protocol", () => {
    const { middleware, req, res, json, status, next } = setup(
      "discord.com/api/webhooks/1053664698949697586/sometoken",
    );

    middleware.use(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Input Webhook is not URL" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects a valid webhook embedded in a hostile URL", () => {
    const { middleware, req, res, json, status, next } = setup(
      "https://evil.example.com/redirect?to=https://discord.com/api/webhooks/1053664698949697586/sometoken",
    );

    middleware.use(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "Input Webhook is not a Discord Webhook URL" });
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts a discordapp.com webhook URL", () => {
    const { middleware, req, res, next } = setup(
      "https://discordapp.com/api/webhooks/1053664698949697586/sometoken",
    );

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("passes a valid Discord webhook URL through", () => {
    const { middleware, req, res, next } = setup(VALID);

    middleware.use(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
