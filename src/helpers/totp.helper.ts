import { createHmac } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Buffer {
  let bits = "";
  for (const c of input.toUpperCase()) {
    const idx = BASE32_ALPHABET.indexOf(c);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(Number.parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Generates a 6-digit TOTP code per RFC 6238 (SHA1, 30s period, 6 digits).
 * Uses Node.js built-in crypto — no external dependencies.
 */
export class TotpHelper {
  static generateCode(base32Secret: string): string {
    const key = base32Decode(base32Secret);
    const counter = Math.floor(Date.now() / 1000 / 30);
    const counterBuf = Buffer.alloc(8);
    counterBuf.writeBigUInt64BE(BigInt(counter));
    const hmac = createHmac("sha1", key).update(counterBuf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      (((hmac[offset] & 0x7f) << 24) |
        (hmac[offset + 1] << 16) |
        (hmac[offset + 2] << 8) |
        hmac[offset + 3]) %
      1_000_000;
    return code.toString().padStart(6, "0");
  }
}
