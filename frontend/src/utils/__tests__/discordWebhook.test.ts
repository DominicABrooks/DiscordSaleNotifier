import {
  DISCORD_WEBHOOK_PATTERN,
  isValidDiscordWebhookUrl,
  verifyWebhookReachable
} from "../discordWebhook";

const TOKEN = "valid-token-value";
const VALID_URL = "https://discord.com/api/webhooks/123456789012345678/" + TOKEN;
const VALID_APP_URL = "https://discordapp.com/api/webhooks/123456789012345678/" + TOKEN;

describe("isValidDiscordWebhookUrl", () => {
  it.each([
    ["discord.com URL", VALID_URL],
    ["discordapp.com URL", VALID_APP_URL],
    ["17-digit webhook id", "https://discord.com/api/webhooks/12345678901234567/" + TOKEN],
    ["19-digit webhook id", "https://discord.com/api/webhooks/1234567890123456789/" + TOKEN]
  ])("accepts a valid %s", (_label, url) => {
    expect(isValidDiscordWebhookUrl(url)).toBe(true);
  });

  it.each([
    ["wrong domain", "https://example.com/not-a-discord-webhook"],
    ["plain text", "not-a-webhook"],
    ["empty value", ""],
    ["http instead of https", "http://discord.com/api/webhooks/123456789012345678/" + TOKEN],
    ["16-digit webhook id", "https://discord.com/api/webhooks/1234567890123456/" + TOKEN],
    ["20-digit webhook id", "https://discord.com/api/webhooks/12345678901234567890/" + TOKEN],
    ["missing token", "https://discord.com/api/webhooks/123456789012345678"],
    ["missing token value", "https://discord.com/api/webhooks/123456789012345678/"],
    ["leading content", "xx" + VALID_URL],
    ["trailing content", VALID_URL + " extra"]
  ])("rejects %s", (_label, url) => {
    expect(isValidDiscordWebhookUrl(url)).toBe(false);
  });

  it("exposes the shared pattern used for validation", () => {
    expect(DISCORD_WEBHOOK_PATTERN.test(VALID_URL)).toBe(true);
    expect(DISCORD_WEBHOOK_PATTERN.test("not-a-webhook")).toBe(false);
  });
});

describe("verifyWebhookReachable", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("returns true and GETs the URL when the webhook responds ok", async () => {
    (global.fetch as unknown as jest.Mock).mockResolvedValue({ ok: true });
    await expect(verifyWebhookReachable(VALID_URL)).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(VALID_URL);
  });

  it("returns false when the webhook responds with an error status", async () => {
    (global.fetch as unknown as jest.Mock).mockResolvedValue({ ok: false });
    await expect(verifyWebhookReachable(VALID_URL)).resolves.toBe(false);
  });

  it("returns false when the request throws", async () => {
    (global.fetch as unknown as jest.Mock).mockRejectedValue(new Error("Network down"));
    await expect(verifyWebhookReachable(VALID_URL)).resolves.toBe(false);
  });
});
