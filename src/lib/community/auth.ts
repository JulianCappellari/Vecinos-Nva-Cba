import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import prisma from "@/lib/prisma";
import { CommunityError, digest } from "./security";
import type { Viewer } from "./types";

const COOKIE = process.env.NODE_ENV === "production" ? "__Host-vnc-community" : "vnc-community";
const MONTH = 30 * 86400;
export async function currentUser(): Promise<Viewer | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await prisma.communitySession.findUnique({
    where: { tokenHash: digest(token) },
    select: { expiresAt: true, user: { select: { id: true, name: true, province: true, role: true } } },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new CommunityError("Ingresá a tu cuenta para continuar.", 401);
  return user;
}
export function requireAdmin(user: Viewer) {
  if (user.role !== "ADMIN") throw new CommunityError("Esta acción es para el equipo de moderación.", 403);
}
export async function startSession(userId: string, expectedPasswordHash?: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "CommunityUser" WHERE id = ${userId} FOR UPDATE`;
    const account = await tx.communityUser.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!account || (expectedPasswordHash && account.passwordHash !== expectedPasswordHash))
      throw new CommunityError("La cuenta cambió. Volvé a ingresar.", 401);
    await tx.communitySession.deleteMany({ where: { userId, expiresAt: { lte: new Date() } } });
    await tx.communitySession.create({ data: { tokenHash: digest(token), userId, expiresAt: new Date(Date.now() + MONTH * 1000) } });
  });
  cookies().set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: MONTH });
}
export async function endSession() {
  const token = cookies().get(COOKIE)?.value;
  if (token) await prisma.communitySession.deleteMany({ where: { tokenHash: digest(token) } });
  cookies().set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}
