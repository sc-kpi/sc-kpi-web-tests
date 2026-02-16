import { Config } from "../config/config.js";

interface BroadcastRequest {
  titleKey: string;
  bodyKey: string;
  bodyArgs?: string[];
  category: string;
  targetTier?: string;
}

export class NotificationHelper {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(adminToken: string) {
    this.token = adminToken;
    this.baseUrl = Config.apiBaseUrl();
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${this.token}`,
    };
  }

  async broadcast(request: BroadcastRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/notifications/broadcast`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Broadcast failed: ${response.status}`);
    }
  }

  async cleanup(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/v1/admin/notifications/cleanup?days=0`, {
        method: "DELETE",
        headers: this.headers(),
      });
    } catch {
      // best-effort cleanup
    }
  }
}
