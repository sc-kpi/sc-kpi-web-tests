import { Config } from "../config/config.js";
import { TotpHelper } from "./totp.helper.js";

function extractCookie(setCookie: string[], name: string): string | undefined {
  const prefix = `${name}=`;
  for (const cookie of setCookie) {
    if (cookie.startsWith(prefix)) {
      return cookie.substring(prefix.length, cookie.indexOf(";"));
    }
  }
  return undefined;
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

    // Step 1: Login to get access_token
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
    if (!accessToken) {
      throw new Error("No access_token cookie in login response");
    }

    // Step 2: Setup TOTP
    const setupResponse = await fetch(`${apiBase}/api/v1/auth/2fa/setup`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    if (!setupResponse.ok) {
      throw new Error(`2FA setup failed: ${setupResponse.status}`);
    }
    const setupData = (await setupResponse.json()) as { manualEntryKey: string };
    const totpSecret = setupData.manualEntryKey;

    // Step 3: Verify setup with TOTP code
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

    // Step 4: Re-login — now returns mfa_token since 2FA is enabled
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

    // Step 5: Verify MFA login with TOTP code
    const loginCode = TotpHelper.generateCode(totpSecret);
    const verifyLoginResponse = await fetch(`${apiBase}/api/v1/auth/2fa/verify-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: `mfa_token=${mfaToken}`,
      },
      body: JSON.stringify({ code: loginCode }),
    });
    if (!verifyLoginResponse.ok) {
      throw new Error(`2FA verify-login failed: ${verifyLoginResponse.status}`);
    }

    const finalCookies = verifyLoginResponse.headers.getSetCookie();
    const mfaVerifiedToken = extractCookie(finalCookies, "access_token");
    if (!mfaVerifiedToken) {
      throw new Error("No access_token cookie in verify-login response");
    }

    AuthApiHelper.cachedAdminToken = mfaVerifiedToken;
    AuthApiHelper.cachedAdminTotpSecret = totpSecret;
    return mfaVerifiedToken;
  }
}
