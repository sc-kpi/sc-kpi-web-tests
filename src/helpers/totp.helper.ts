import { generateSync } from "otplib";

export class TotpHelper {
  static generateCode(secret: string): string {
    return generateSync({ secret });
  }
}
