import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

function key(): Buffer {
  const raw = process.env["EMAIL_ACCOUNT_KEY_SECRET"];
  if (!raw) throw new Error("EMAIL_ACCOUNT_KEY_SECRET is not set");
  return createHash("sha256").update(raw).digest();
}

export function encryptMailPassword(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64");
}

export function decryptMailPassword(stored: string): string {
  const buf = Buffer.from(stored, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
}
