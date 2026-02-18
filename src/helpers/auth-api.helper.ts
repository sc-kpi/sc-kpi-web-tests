import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Config } from "../config/config.js";
import { TotpHelper } from "./totp.helper.js";

const ADMIN_TOTP_SECRET_PATH = resolve(
  import.meta.dirname,
  "../../playwright/.auth/.admin-totp-secret",
);

function extractCookie(setCookie: string[], name: string): string | undefined {
  const prefix = `${name}=`;
  for (const cookie of setCookie) {
    if (cookie.startsWith(prefix)) {
      return cookie.substring(prefix.length, cookie.indexOf(";"));
    }
  }
  return undefined;
}

function readSavedTotpSecret(): string | undefined {
  try {
    return readFileSync(ADMIN_TOTP_SECRET_PATH, "utf-8").trim();
  } catch {
    return undefined;
  }
}

export class AuthApiHelper {
  private static cachedAdminToken: string | undefined;
  private static cachedAdminTotpSecret: string | undefined;

  static getAdminTotpSecret(): string | undefined {
    return AuthApiHelper.cachedAdminTotpSecret;
  }

  static async getAdminToken(): Promise<string> {
    if (AuthApiHelper.cachedAdminToken) {
      return AuthApiHelper.cachedAdminToken;
    }

    const credentials = Config.auth().tierCredentials.admin;
    if (!credentials) {
      throw new Error("Admin tier credentials not configured");
    }

    const apiBase = Config.apiBaseUrl();

    // Step 1: Login
    const loginResponse = await fetch(`${apiBase}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });
    if (!loginResponse.ok) {
      throw new Error(`Admin login failed: ${loginResponse.status}`);
    }

    const loginCookies = loginResponse.headers.getSetCookie();
    const accessToken = extractCookie(loginCookies, "access_token");
    const mfaToken = extractCookie(loginCookies, "mfa_token");

    if (accessToken) {
      // 2FA not yet enabled — set it up
      return AuthApiHelper.setupMfaAndAuthenticate(apiBase, accessToken);
    }

    if (mfaToken) {
      // 2FA already enabled (e.g. by auth.setup.ts) — verify with saved secret
      return AuthApiHelper.verifyMfaLogin(apiBase, mfaToken);
    }

    throw new Error(
      `Admin login returned neither access_token nor mfa_token (cookies=[${loginCookies.map((c) => c.substring(0, 40)).join(", ")}])`,
    );
  }

  private static async setupMfaAndAuthenticate(
    apiBase: string,
    accessToken: string,
  ): Promise<string> {
    const credentials = Config.auth().tierCredentials.admin;
    if (!credentials) {
      throw new Error("Admin tier credentials not configured");
    }

    // Setup TOTP
    const setupResponse = await fetch(`${apiBase}/api/v1/auth/2fa/setup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    if (!setupResponse.ok) {
      throw new Error(`2FA setup failed: ${setupResponse.status}`);
    }
    const setupData = (await setupResponse.json()) as { manualEntryKey: string };
    const totpSecret = setupData.manualEntryKey;

    // Verify setup
    const setupCode = TotpHelper.generateCode(totpSecret);
    const verifySetupResponse = await fetch(`${apiBase}/api/v1/auth/2fa/verify-setup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code: setupCode }),
    });
    if (!verifySetupResponse.ok) {
      throw new Error(`2FA verify-setup failed: ${verifySetupResponse.status}`);
    }

    // Re-login — now returns mfa_token
    const reLoginResponse = await fetch(`${apiBase}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    });
    if (!reLoginResponse.ok) {
      throw new Error(`Admin re-login failed: ${reLoginResponse.status}`);
    }

    const reLoginCookies = reLoginResponse.headers.getSetCookie();
    const mfaToken = extractCookie(reLoginCookies, "mfa_token");
    if (!mfaToken) {
      throw new Error("No mfa_token cookie in re-login response");
    }

    AuthApiHelper.cachedAdminTotpSecret = totpSecret;
    return AuthApiHelper.completeMfaVerification(apiBase, mfaToken, totpSecret);
  }

  private static async verifyMfaLogin(apiBase: string, mfaToken: string): Promise<string> {
    const totpSecret = AuthApiHelper.cachedAdminTotpSecret ?? readSavedTotpSecret();
    if (!totpSecret) {
      throw new Error(
        "2FA is enabled but no TOTP secret available (not cached and not found on disk)",
      );
    }

    AuthApiHelper.cachedAdminTotpSecret = totpSecret;
    return AuthApiHelper.completeMfaVerification(apiBase, mfaToken, totpSecret);
  }

  private static async completeMfaVerification(
    apiBase: string,
    mfaToken: string,
    totpSecret: string,
  ): Promise<string> {
    const code = TotpHelper.generateCode(totpSecret);
    const verifyResponse = await fetch(`${apiBase}/api/v1/auth/2fa/verify-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: `mfa_token=${mfaToken}`,
      },
      body: JSON.stringify({ code }),
    });
    if (!verifyResponse.ok) {
      throw new Error(`2FA verify-login failed: ${verifyResponse.status}`);
    }

    const finalCookies = verifyResponse.headers.getSetCookie();
    const verifiedToken = extractCookie(finalCookies, "access_token");
    if (!verifiedToken) {
      throw new Error("No access_token cookie in verify-login response");
    }

    AuthApiHelper.cachedAdminToken = verifiedToken;
    return verifiedToken;
  }
}
