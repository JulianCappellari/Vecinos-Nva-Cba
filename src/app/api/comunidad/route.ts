import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { currentUser, endSession, requireUser, startSession } from "@/lib/community/auth";
import { assertSameOrigin, CommunityError, hashPassword, PASSWORD_PREFIX, rateLimit, readBoundedBody, verifyPassword } from "@/lib/community/security";
import { getPost, listPosts, savePost, changeParticipation, closePost, reportPost, reviewPost } from "@/lib/community/posts";
import { loginSchema, registerSchema, PostValidationError } from "@/lib/community/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function reply(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
}
function failure(error: unknown) {
  if (error instanceof CommunityError) return reply({ ok: false, message: error.message }, error.status);
  if (error instanceof PostValidationError) return reply({ ok: false, message: error.message }, 400);
  if (error instanceof z.ZodError) return reply({ ok: false, message: "Revisá los campos: " + error.issues.slice(0, 3).map(i => i.path.join(".") + " — " + i.message).join("; ") }, 400);
  if (error instanceof SyntaxError) return reply({ ok: false, message: "El formulario no se pudo leer. Volvé a intentar." }, 400);
  if ((error as { code?: string })?.code === "P2002") return reply({ ok: false, message: "Ese registro ya existe. Revisá tus datos o ingresá a tu cuenta." }, 409);
  console.error("[community] Request failed:", error instanceof Error ? error.name : "UnknownError");
  return reply({ ok: false, message: "La comunidad no está disponible ahora. Volvé a intentar en unos minutos." }, 503);
}
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const user = await currentUser();
    if (params.get("view") === "session") return reply({ user });
    if (params.has("id")) {
      const post = await getPost(params.get("id")!, user);
      return post ? reply({ post }) : reply({ ok: false, message: "Esta publicación ya no está disponible." }, 404);
    }
    return reply(await listPosts(Object.fromEntries(params), user));
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!request.headers.get("content-type")?.includes("application/json")) throw new CommunityError("Usá el formulario de la página.", 415);
    const { action, payload } = z.object({ action: z.string(), payload: z.unknown().optional() }).parse(JSON.parse((await readBoundedBody(request, 48000)).toString("utf8")));
    if (action === "register" || action === "login") {
      const data = action === "register" ? registerSchema.parse(payload) : loginSchema.parse(payload);
      // IP throttling uses only a digest in storage. Email throttling also works without a trusted proxy.
      const ip = process.env.COMMUNITY_TRUST_PROXY === "1" ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown") : "direct";
      await rateLimit("auth-ip:" + ip, 40, 60000);
      await rateLimit("auth-email:" + data.email, 12, 15 * 60000);
      if (action === "register") {
        const registration = registerSchema.parse(payload);
        const user = await prisma.communityUser.create({ data: { email: registration.email, name: registration.name, province: registration.province, passwordHash: await hashPassword(registration.password) }, select: { id: true } });
        await startSession(user.id);
        return reply({ ok: true, message: "Tu cuenta está lista." });
      }
      const user = await prisma.communityUser.findUnique({ where: { email: data.email } });
      // Derive a hash even when account does not exist to reduce account timing differences.
      const valid = user ? await verifyPassword(data.password, user.passwordHash) : (await hashPassword(data.password), false);
      if (!valid || !user) throw new CommunityError("El correo o la contraseña no coinciden.", 401);
      let sessionHash = user.passwordHash;
      if (!sessionHash.startsWith(PASSWORD_PREFIX + ":")) {
        const upgraded = await hashPassword(data.password);
        const changed = await prisma.communityUser.updateMany({ where: { id: user.id, passwordHash: sessionHash }, data: { passwordHash: upgraded } });
        if (!changed.count) throw new CommunityError("La cuenta cambió. Volvé a ingresar.", 401);
        sessionHash = upgraded;
      }
      await startSession(user.id, sessionHash);
      return reply({ ok: true, message: "Ya ingresaste." });
    }
    const user = await requireUser();
    if (action === "logout") { await endSession(); return reply({ ok: true, message: "Cerraste tu sesión." }); }
    if (action === "password") {
      const v = z.object({ current: z.string().min(1).max(128), password: z.string().min(10).max(128) }).parse(payload);
      await rateLimit("password:" + user.id, 5, 15 * 60000);
      const account = await prisma.communityUser.findUniqueOrThrow({ where: { id: user.id } });
      if (!await verifyPassword(v.current, account.passwordHash)) throw new CommunityError("La contraseña actual no coincide.");
      const nextHash = await hashPassword(v.password);
      await prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT id FROM "CommunityUser" WHERE id = ${user.id} FOR UPDATE`;
        const changed = await tx.communityUser.updateMany({ where: { id: user.id, passwordHash: account.passwordHash }, data: { passwordHash: nextHash } });
        if (!changed.count) throw new CommunityError("La cuenta cambió. Volvé a ingresar.", 409);
        await tx.communitySession.deleteMany({ where: { userId: user.id } });
      });
      await startSession(user.id, nextHash);
      return reply({ ok: true, message: "Cambiaste la contraseña y cerramos las sesiones anteriores." });
    }
    if (action === "save") { const id = await savePost(payload, user); return reply({ ok: true, id, message: "Guardamos tu publicación. Va a aparecer cuando el equipo la apruebe." }); }
    if (action === "participate") { await changeParticipation(payload, user); return reply({ ok: true, message: "Actualizamos tu inscripción." }); }
    if (action === "close") { await closePost(payload, user); return reply({ ok: true, message: "Cerraste la publicación. Ya no aparece en los listados." }); }
    if (action === "report") { await reportPost(payload, user); return reply({ ok: true, message: "Recibimos tu reporte. Lo revisará el equipo." }); }
    if (action === "review") { await reviewPost(payload, user); return reply({ ok: true, message: "La revisión quedó guardada." }); }
    throw new CommunityError("La acción no está disponible.", 400);
  } catch (error) { return failure(error); }
}
