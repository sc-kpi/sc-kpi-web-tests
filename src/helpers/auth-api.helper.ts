import { Config } from "../config/config.js";

export class AuthApiHelper {
  static async getAdminToken(): Promise<string> {
    const credentials = Config.auth().tierCredentials.admin;
    if (!credentials) {
      throw new Error("Admin tier credentials not configured");
    }

    const response = await fetch(`${Config.apiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });

    if (!response.ok) {
      throw new Error(`Admin login failed: ${response.status}`);
    }

    // Token is in the Set-Cookie header, not the response body
    const setCookie = response.headers.getSetCookie();
    const prefix = "access_token=";
    for (const cookie of setCookie) {
      if (cookie.startsWith(prefix)) {
        return cookie.substring(prefix.length, cookie.indexOf(";"));
      }
    }

    throw new Error("No access_token cookie in login response");
  }
}
