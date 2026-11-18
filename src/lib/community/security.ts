import { createHash, randomBytes, scrypt as derive, timingSafeEqual } from "node:crypto";
import prisma from "@/lib/prisma";

export class CommunityError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const PASSWORD_PREFIX = "scrypt-v1:32768:8:3";
const scrypt = (password: string, salt: string, legacy = false) => new Promise<Buffer>((resolve, reject) => {
  // OWASP's 32 MiB / p=3 profile; retain the short-lived initial format for safe upgrades.
  derive(password, salt, 64, { N: legacy ? 16384 : 32768, r: 8, p: legacy ? 1 : 3, maxmem: 64 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key));
});
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return PASSWORD_PREFIX + ":" + salt + ":" + (await scrypt(password, salt)).toString("hex");
}
export async function verifyPassword(password: string, stored: string) {
  const modern = stored.startsWith(PASSWORD_PREFIX + ":");
  const parts = stored.split(":");
  if (modern ? parts.length !== 6 : parts.length !== 2) return false;
  const [salt, encoded] = modern ? parts.slice(4) : parts;
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(encoded)) return false;
  const key = await scrypt(password, salt, !modern), expected = Buffer.from(encoded, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}
export async function rateLimit(identity: string, max: number, windowMs: number) {
  const bucket = Math.floor(Date.now() / windowMs);
  const row = await prisma.communityRateLimit.upsert({
    where: { key: digest(identity + ":" + bucket) },
    create: { key: digest(identity + ":" + bucket), attempts: 1, expiresAt: new Date((bucket + 1) * windowMs) },
    update: { attempts: { increment: 1 } },
  });
  if (row.attempts > max) throw new CommunityError("Llegaste al límite de intentos. Esperá un momento y volvé a probar.", 429);
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // Next may normalize Request.url to localhost; Host retains the browser-facing authority.
  const expected = process.env.COMMUNITY_ORIGIN || new URL(request.url).protocol + "//" + request.headers.get("host");
  if (!origin || origin !== expected || request.headers.get("sec-fetch-site") === "cross-site")
    throw new CommunityError("La solicitud debe hacerse desde esta página.", 403);
}
export async function readBoundedBody(request: Request, maxBytes: number) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maxBytes) throw new CommunityError("El archivo o formulario supera el tamaño permitido.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new CommunityError("El formulario está vacío.");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new CommunityError("El archivo o formulario supera el tamaño permitido.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
