import { Config } from "../config/config.js";

interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tier?: number;
}

interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export class UserHelper {
  private readonly baseUrl: string;
  private readonly adminToken: string;
  private readonly createdUserIds: string[] = [];

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

  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const body = { tier: 1, ...request };
    const response = await fetch(`${this.baseUrl}/api/v1/users`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.status}`);
    }
    const user = (await response.json()) as UserResponse;
    this.createdUserIds.push(user.id);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/users/${id}`, {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete user: ${response.status}`);
    }
  }

  async cleanup(): Promise<void> {
    for (const id of this.createdUserIds) {
      try {
        await this.deleteUser(id);
      } catch {
        // Best effort cleanup
      }
    }
    this.createdUserIds.length = 0;
  }
}
