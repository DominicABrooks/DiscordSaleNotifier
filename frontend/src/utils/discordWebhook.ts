export const DISCORD_WEBHOOK_PATTERN = /^https:\/\/discord(app)?\.com\/api\/webhooks\/\d{17,19}\/\S+$/;

export function isValidDiscordWebhookUrl(url: string): boolean {
  return DISCORD_WEBHOOK_PATTERN.test(url);
}

export async function verifyWebhookReachable(url: string) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}
