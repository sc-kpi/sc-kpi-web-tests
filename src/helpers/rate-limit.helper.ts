import { Config } from "../config/config.js";

interface CreateRateLimitRuleRequest {
  name: string;
  description?: string;
  endpointPattern: string;
  httpMethod?: string;
  limitPerPeriod: number;
  periodSeconds: number;
  burstCapacity: number;
  scope: string;
  targetTier?: number | null;
  targetUserId?: string | null;
  timeWindowStart?: string | null;
  timeWindowEnd?: string | null;
  priority: number;
  enabled: boolean;
}

interface RateLimitRuleResponse {
  id: string;
  name: string;
  description: string | null;
  endpointPattern: string;
  httpMethod: string | null;
  limitPerPeriod: number;
  periodSeconds: number;
  burstCapacity: number;
  scope: string;
  targetTier: number | null;
  targetUserId: string | null;
  priority: number;
  enabled: boolean;
}

export class RateLimitHelper {
  private readonly baseUrl: string;
  private readonly adminToken: string;
  private readonly createdRuleIds: string[] = [];

  constructor(adminToken: string) {
    this.baseUrl = Config.apiBaseUrl();
    this.adminToken = adminToken;
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${this.adminToken}`,
    };
  }

  async createRule(request: CreateRateLimitRuleRequest): Promise<RateLimitRuleResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/rate-limits`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to create rate limit rule: ${response.status}`);
    }
    const rule = (await response.json()) as RateLimitRuleResponse;
    this.createdRuleIds.push(rule.id);
    return rule;
  }

  async deleteRule(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/rate-limits/${id}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete rate limit rule: ${response.status}`);
    }
  }

  async cleanup(): Promise<void> {
    for (const id of this.createdRuleIds) {
      try {
        await this.deleteRule(id);
      } catch {
        // Best effort cleanup
      }
    }
    this.createdRuleIds.length = 0;
  }
}
