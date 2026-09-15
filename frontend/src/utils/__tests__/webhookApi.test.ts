import { submitWebhookRequest } from "../webhookApi";

const fetchMock = () => global.fetch as unknown as jest.Mock;

const WEBHOOK_URL = "https://discord.com/api/webhooks/123456789012345678/valid-token-value";

const CREATE_REQUEST = {
  endpoint: "create",
  method: "POST",
  webhookUrl: WEBHOOK_URL,
  successMessage: "Webhook added successfully!",
  failureMessage: "Failed to create webhook"
} as const;

describe("submitWebhookRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REACT_APP_API_URL;
    global.fetch = jest.fn();
  });

  it("POSTs the webhook as JSON and resolves with the success message", async () => {
    fetchMock().mockResolvedValue({ ok: true } as Response);

    await expect(submitWebhookRequest({ ...CREATE_REQUEST })).resolves.toBe(
      "Webhook added successfully!"
    );

    expect(fetchMock()).toHaveBeenCalledTimes(1);
    expect(fetchMock().mock.calls[0][0]).toBe("/api/webhook/create");
    expect(fetchMock().mock.calls[0][1]).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    expect(JSON.parse(fetchMock().mock.calls[0][1].body as string)).toEqual({
      webhook: WEBHOOK_URL
    });
  });

  it("prefixes the endpoint with REACT_APP_API_URL when configured", async () => {
    process.env.REACT_APP_API_URL = "https://api.example.com";
    fetchMock().mockResolvedValue({ ok: true } as Response);

    await expect(submitWebhookRequest({ ...CREATE_REQUEST })).resolves.toBe(
      "Webhook added successfully!"
    );
    expect(fetchMock().mock.calls[0][0]).toBe("https://api.example.com/api/webhook/create");
  });

  it("throws the API error message when the request fails", async () => {
    fetchMock().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Webhook already exists" })
    } as Response);

    await expect(submitWebhookRequest({ ...CREATE_REQUEST })).rejects.toThrow(
      "Webhook already exists"
    );
  });

  it("throws the failure message when the error body has no details", async () => {
    fetchMock().mockResolvedValue({ ok: false, json: async () => ({}) } as Response);

    await expect(submitWebhookRequest({ ...CREATE_REQUEST })).rejects.toThrow(
      "Failed to create webhook"
    );
  });

  it("throws the failure message when the error body is unreadable", async () => {
    fetchMock().mockResolvedValue({
      ok: false,
      json: async (): Promise<unknown> => {
        throw new Error("bad json");
      }
    } as Response);

    await expect(submitWebhookRequest({ ...CREATE_REQUEST })).rejects.toThrow(
      "Failed to create webhook"
    );
  });

  it("sends a DELETE request for the delete endpoint", async () => {
    fetchMock().mockResolvedValue({ ok: true } as Response);

    await expect(
      submitWebhookRequest({
        endpoint: "delete",
        method: "DELETE",
        webhookUrl: WEBHOOK_URL,
        successMessage: "Webhook deleted successfully!",
        failureMessage: "Failed to delete webhook"
      })
    ).resolves.toBe("Webhook deleted successfully!");
    expect(fetchMock().mock.calls[0][0]).toBe("/api/webhook/delete");
    expect(fetchMock().mock.calls[0][1]).toMatchObject({ method: "DELETE" });
  });

  it("throws the network error message when the request throws", async () => {
    fetchMock().mockRejectedValue(new Error("Network down"));

    await expect(submitWebhookRequest({ ...CREATE_REQUEST })).rejects.toThrow("Network down");
  });

  it("throws the failure message when the request rejects with a non-error", async () => {
    fetchMock().mockRejectedValue("boom-string");

    await expect(submitWebhookRequest({ ...CREATE_REQUEST })).rejects.toThrow(
      "Failed to create webhook"
    );
  });
});
