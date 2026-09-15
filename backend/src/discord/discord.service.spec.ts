import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiscordService } from "./discord.service.js";

const VALID_URL =
  "https://discord.com/api/webhooks/1053664698949697586/Bq8WVRf-m2giLxFUX2-qRxc7lMyS9LXtiRXp9EmNS4UP8MsL4Z20lkfJianG8yZJMis4";
const VALID_APP_URL =
  "https://discordapp.com/api/webhooks/1053664698949697586/Bq8WVRf-m2giLxFUX2-qRxc7lMyS9LXtiRXp9EmNS4UP8MsL4Z20lkfJianG8yZJMis4";

function setup() {
  const service = new DiscordService({} as any);
  return { service };
}

describe("DiscordService webhook URL allowlist", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fetches a valid discord.com webhook URL", async () => {
    const { service } = setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await service.getFromWebhook(VALID_URL);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe(VALID_URL);
  });

  it("fetches a valid discordapp.com webhook URL", async () => {
    const { service } = setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await service.getFromWebhook(VALID_APP_URL);

    expect(fetchMock).toHaveBeenCalledOnce();
  });
  it("rejects a non-Discord host without fetching", async () => {
    const { service } = setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      service.getFromWebhook("https://example.com/api/webhooks/1053664698949697586/token"),
    ).rejects.toThrow("URL is not an allowed Discord webhook");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects plain http without fetching", async () => {
    const { service } = setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(service.getFromWebhook(VALID_URL.replace("https://", "http://"))).rejects.toThrow(
      "URL is not an allowed Discord webhook",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed URL without fetching", async () => {
    const { service } = setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(service.getFromWebhook("not a url")).rejects.toThrow("Invalid Discord webhook URL");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a non-Discord host when sending without contacting it", async () => {
    const { service } = setup();

    await expect(service.sendToDiscordWebhook("https://example.com/hook", { content: "hi" })).rejects.toThrow(
      "URL is not an allowed Discord webhook",
    );
  });
});

