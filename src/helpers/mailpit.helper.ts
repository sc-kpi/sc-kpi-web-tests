import { Config } from "../config/config.js";

interface MailpitMessage {
  ID: string;
  Subject: string;
  From: { Address: string };
  To: { Address: string }[];
}

interface MailpitSearchResponse {
  messages_count: number;
  messages: MailpitMessage[];
}

export async function waitForEmail(
  recipient: string,
  timeoutMs = 10000,
): Promise<MailpitSearchResponse> {
  const baseUrl = Config.mailpitBaseUrl();
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await fetch(
      `${baseUrl}/api/v1/search?query=to:${encodeURIComponent(recipient)}`,
    );
    if (response.ok) {
      const data = (await response.json()) as MailpitSearchResponse;
      if (data.messages_count > 0) {
        return data;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`No email received for ${recipient} within ${timeoutMs}ms`);
}

export async function getMessageBody(messageId: string): Promise<string> {
  const baseUrl = Config.mailpitBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/message/${messageId}`);
  if (!response.ok) {
    throw new Error(`Failed to get message ${messageId}: ${response.status}`);
  }
  const data = (await response.json()) as { Text: string };
  return data.Text;
}

export function extractResetToken(emailBody: string): string {
  const match = emailBody.match(/token=([a-f0-9-]+)/);
  if (!match) {
    throw new Error("Reset token not found in email body");
  }
  return match[1];
}

export async function deleteAllMessages(): Promise<void> {
  const baseUrl = Config.mailpitBaseUrl();
  await fetch(`${baseUrl}/api/v1/messages`, { method: "DELETE" });
}
