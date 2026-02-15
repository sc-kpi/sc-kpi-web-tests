import { Config } from "../config/config.js";

interface CreateFeatureFlagRequest {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  environment?: string;
  rolloutPercentage: number;
}

interface FeatureFlagResponse {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  environment: string | null;
  rolloutPercentage: number;
}

interface ToggleRequest {
  enabled: boolean;
  reason?: string;
}

export class FeatureFlagHelper {
  private readonly baseUrl: string;
  private readonly adminToken: string;
  private readonly createdFlagIds: string[] = [];

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

  async createFlag(request: CreateFeatureFlagRequest): Promise<FeatureFlagResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/feature-flags`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to create feature flag: ${response.status}`);
    }
    const flag = (await response.json()) as FeatureFlagResponse;
    this.createdFlagIds.push(flag.id);
    return flag;
  }

  async toggleFlag(id: string, request: ToggleRequest): Promise<FeatureFlagResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/feature-flags/${id}/toggle`, {
      method: "PATCH",
      headers: this.headers(),
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to toggle feature flag: ${response.status}`);
    }
    return (await response.json()) as FeatureFlagResponse;
  }

  async deleteFlag(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/admin/feature-flags/${id}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete feature flag: ${response.status}`);
    }
  }

  async cleanup(): Promise<void> {
    for (const id of this.createdFlagIds) {
      try {
        await this.deleteFlag(id);
      } catch {
        // Best effort cleanup
      }
    }
    this.createdFlagIds.length = 0;
  }
}
