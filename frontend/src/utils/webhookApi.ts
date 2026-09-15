export type WebhookEndpoint = 'create' | 'delete';
export type WebhookMethod = 'POST' | 'DELETE';

export interface WebhookRequest {
  endpoint: WebhookEndpoint;
  method: WebhookMethod;
  webhookUrl: string;
  successMessage: string;
  failureMessage: string;
}

function getApiBaseUrl(): string {
  return process.env.REACT_APP_API_URL || "";
}

export async function submitWebhookRequest(request: WebhookRequest) {
  const url = getApiBaseUrl() + "/api/webhook/" + request.endpoint;
  let response: Response;
  try {
    response = await fetch(url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ webhook: request.webhookUrl })
    });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : request.failureMessage);
  }

  if (response.ok) {
    return request.successMessage;
  }

  let message = request.failureMessage;
  try {
    const errorData = (await response.json()) as { error?: string };
    if (errorData.error) {
      message = errorData.error;
    }
  } catch {
    // Keep the default failure message when the error body is unreadable.
  }
  throw new Error(message);
}
