import prisma from "@/lib/prisma";
import { Prisma, type CommunityPost as DbPost } from "@/generated/prisma";
import { z } from "zod";
import { CommunityError, rateLimit } from "./security";
import { requireAdmin } from "./auth";
import { expiryFor, idSchema, KINDS, normalized, postSchema, validatePost, type PostInput, type PostKind } from "./schema";
import type { CommunityPost, ListingResult, Viewer } from "./types";

const include = { author: { select: { name: true } }, image: { select: { url: true } }, _count: { select: { participants: true } } } as const;
type DbResult = DbPost & { author: { name: string }; image: { url: string } | null; _count: { participants: number } };
export function postDTO(post: DbResult, viewer: Viewer | null, joined = false): CommunityPost {
  const data = postSchema.options.find(option => option.shape.kind.value === post.kind)!.shape.data.parse(post.data);
  const visibleContact = post.status === "APPROVED" && post.expiresAt > new Date();
  return {
    id: post.id, kind: post.kind, title: post.title, description: post.description, category: post.category, data,
    status: post.status, author: post.author, imageUrl: post.image?.url ?? null, createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(), expiresAt: post.expiresAt.toISOString(), participants: post._count.participants,
    mine: viewer?.id === post.authorId, joined,
    ...(viewer?.id === post.authorId || viewer?.role === "ADMIN" ? { reviewNote: post.reviewNote, contact: post.contact, imageId: post.imageId } : {}),
    ...(visibleContact ? { contactUrl: "https://wa.me/" + post.contact + "?text=" + encodeURIComponent("Hola, te escribo por «" + post.title + "» en Vecinos de Nueva Córdoba.") } : {}),
    ...(visibleContact && post.kind === "GROUP" ? { groupUrl: (data as Extract<PostInput, {kind: "GROUP"}>["data"]).url } : {}),
  };
}
export const filtersSchema = z.object({
  kind: z.enum(KINDS).optional(), q: z.string().max(100).default(""), category: z.string().max(60).default(""),
  university: z.string().max(100).default(""), career: z.string().max(100).default(""), subject: z.string().max(100).default(""),
  province: z.string().max(40).default(""), operation: z.enum(["", "Vendo", "Dono", "Intercambio"]).default(""),
  maxCost: z.coerce.number().int().min(0).max(10000000).optional(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1), scope: z.enum(["public", "mine", "joined", "moderation", "reports"]).default("public"),
});
export type PostFilters = z.input<typeof filtersSchema>;
export async function listPosts(input: PostFilters, viewer: Viewer | null): Promise<ListingResult> {
  const f = filtersSchema.parse(input), now = new Date();
  const where: Prisma.CommunityPostWhereInput = { ...(f.kind ? { kind: f.kind } : {}) };
  if (f.scope === "mine") { if (!viewer) throw new CommunityError("Ingresá para ver tus publicaciones.", 401); where.authorId = viewer.id; }
  else if (f.scope === "joined") {
    if (!viewer) throw new CommunityError("Ingresá para ver tus inscripciones.", 401);
    where.participants = { some: { userId: viewer.id } };
  } else if (f.scope === "moderation" || f.scope === "reports") {
    if (!viewer) throw new CommunityError("Ingresá para continuar.", 401);
    requireAdmin(viewer);
    if (f.scope === "moderation") where.status = "PENDING";
    else where.reports = { some: { resolvedAt: null } };
  } else {
    where.status = "APPROVED"; where.expiresAt = { gt: now };
    if (f.kind === "PLAN") where.eventAt = { gt: now };
  }
  if (f.q) where.AND = normalized(f.q).split(/\s+/).filter(Boolean).slice(0, 12).map(token => ({ searchText: { contains: token } }));
  if (f.category) where.category = f.category;
  for (const key of ["university", "career", "subject"] as const) if (f[key]) where[key] = { contains: normalized(f[key]) };
  if (f.province) where.province = f.province;
  if (f.maxCost !== undefined) where.cost = { lte: f.maxCost };
  if (f.operation) where.data = { path: ["operation"], equals: f.operation };
  if (f.date) {
    const start = new Date(f.date + "T00:00:00-03:00");
    if (isNaN(start.getTime())) throw new CommunityError("Elegí una fecha válida.");
    where.eventAt = { gte: start > now ? start : now, lt: new Date(start.getTime() + 86400000) };
  }
  const [posts, total] = await prisma.$transaction([
    prisma.communityPost.findMany({ where, include, orderBy: f.kind === "PLAN" && f.scope === "public" ? [{ eventAt: "asc" }, { id: "asc" }] : [{ createdAt: "desc" }, { id: "desc" }], take: 12, skip: (f.page - 1) * 12 }),
    prisma.communityPost.count({ where }),
  ]);
  const joined = viewer ? await prisma.communityParticipation.findMany({ where: { userId: viewer.id, postId: { in: posts.map(p => p.id) } }, select: { postId: true } }) : [];
  const joinedIds = new Set(joined.map(p => p.postId));
  return { posts: posts.map(p => postDTO(p, viewer, joinedIds.has(p.id))), total, pages: Math.ceil(total / 12), page: f.page };
}
export async function getPost(id: string, viewer: Viewer | null) {
  idSchema.parse(id);
  const post = await prisma.communityPost.findUnique({ where: { id }, include });
  const joined = viewer ? !!await prisma.communityParticipation.findUnique({ where: { postId_userId: { postId: id, userId: viewer.id } } }) : false;
  if (!post || (!joined && viewer?.id !== post.authorId && viewer?.role !== "ADMIN" && (post.status !== "APPROVED" || post.expiresAt <= new Date()))) return null;
  return postDTO(post, viewer, joined);
}
function columns(value: PostInput) {
  return {
    kind: value.kind, title: value.title, description: value.description, category: value.category,
    data: value.data as Prisma.InputJsonValue, contact: value.contact, imageId: value.imageId ?? null,
    searchText: normalized([value.title, value.description, value.category, ...Object.values(value.data)].join(" ")),
    university: value.kind === "STUDY" ? normalized(value.data.university) : null,
    career: value.kind === "STUDY" ? normalized(value.data.career) : null,
    subject: value.kind === "STUDY" ? normalized(value.data.subject) : null,
    province: value.kind === "GROUP" ? value.data.province : null,
    cost: value.kind === "PLAN" || value.kind === "BENEFIT" ? value.data.cost : value.kind === "EXCHANGE" ? value.data.price : null,
    eventAt: value.kind === "PLAN" ? new Date(value.data.startsAt) : null,
    expiresAt: expiryFor(value),
  };
}
export async function savePost(input: unknown, viewer: Viewer) {
  const envelope = z.object({ post: z.unknown(), submissionKey: z.string().uuid().optional(), id: idSchema.optional(), version: z.string().datetime().optional() }).parse(input);
  const value = validatePost(envelope.post);
  if (value.imageId) {
    const asset = await prisma.communityAsset.findFirst({ where: { id: value.imageId, ownerId: viewer.id } });
    if (!asset) throw new CommunityError("La foto no pertenece a tu cuenta.", 403);
  }
  if (!envelope.id) {
    if (!envelope.submissionKey) throw new CommunityError("Volvé a abrir el formulario e intentá de nuevo.");
    const previous = await prisma.communityPost.findUnique({ where: { submissionKey: envelope.submissionKey } });
    if (previous) {
      if (previous.authorId !== viewer.id) throw new CommunityError("No se pudo guardar. Volvé a intentar.", 409);
      return previous.id;
    }
    await rateLimit("post:" + viewer.id, 15, 86400000);
    const post = await prisma.communityPost.create({ data: { ...columns(value), authorId: viewer.id, submissionKey: envelope.submissionKey } });
    return post.id;
  }
  return prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "CommunityPost" WHERE id = ${envelope.id} FOR UPDATE`;
    const previous = await tx.communityPost.findUnique({ where: { id: envelope.id }, include: { _count: { select: { participants: true } } } });
    if (!previous || previous.authorId !== viewer.id) throw new CommunityError("Solo podés editar tus publicaciones.", 403);
    if (!envelope.version || previous.updatedAt.toISOString() !== envelope.version) throw new CommunityError("La publicación cambió. Recargá antes de editar.", 409);
    if (previous._count.participants > 0) throw new CommunityError("Hay personas inscriptas. Cerrá este encuentro y creá otro para cambiar los datos.", 409);
    if (previous.kind !== value.kind) throw new CommunityError("No se puede cambiar el tipo de publicación.");
    await tx.communityPost.update({ where: { id: previous.id }, data: { ...columns(value), status: "PENDING", reviewNote: null } });
    return previous.id;
  });
}
export async function changeParticipation(input: unknown, viewer: Viewer) {
  const { id, join } = z.object({ id: idSchema, join: z.boolean() }).parse(input);
  await rateLimit("join:" + viewer.id, 40, 60000);
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "CommunityPost" WHERE id = ${id} FOR UPDATE`;
    const post = await tx.communityPost.findUnique({ where: { id }, include: { _count: { select: { participants: true } } } });
    if (!post) throw new CommunityError("El encuentro ya no está disponible.", 404);
    if (!join) { await tx.communityParticipation.deleteMany({ where: { postId: id, userId: viewer.id } }); return; }
    if (post.authorId === viewer.id) throw new CommunityError("Ya sos quien organiza este encuentro.");
    if (!["PLAN", "STUDY"].includes(post.kind) || post.status !== "APPROVED" || post.expiresAt <= new Date() || (post.eventAt && post.eventAt <= new Date())) throw new CommunityError("Las inscripciones están cerradas.", 409);
    if (await tx.communityParticipation.findUnique({ where: { postId_userId: { postId: id, userId: viewer.id } } })) return;
    const capacity = z.object({ capacity: z.number().int().min(2).max(50) }).parse(post.data).capacity;
    if (post._count.participants >= capacity) throw new CommunityError("Se completaron los cupos. Podés elegir otro encuentro.", 409);
    await tx.communityParticipation.create({ data: { postId: id, userId: viewer.id } });
  });
}
export async function closePost(input: unknown, viewer: Viewer) {
  const { id } = z.object({ id: idSchema }).parse(input);
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "CommunityPost" WHERE id = ${id} FOR UPDATE`;
    const post = await tx.communityPost.findUnique({ where: { id } });
    if (!post || post.authorId !== viewer.id) throw new CommunityError("Solo podés cerrar tus publicaciones.", 403);
    await tx.communityPost.update({ where: { id }, data: { status: "CLOSED" } });
  });
}
export async function reviewPost(input: unknown, viewer: Viewer) {
  requireAdmin(viewer);
  const v = z.object({ id: idSchema, decision: z.enum(["APPROVED", "REJECTED", "CLOSED"]), note: z.string().trim().min(5).max(500), version: z.string().datetime() }).parse(input);
  await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "CommunityPost" WHERE id = ${v.id} FOR UPDATE`;
    const post = await tx.communityPost.findUnique({ where: { id: v.id } });
    if (!post) throw new CommunityError("No se encontró la publicación.", 404);
    if (post.updatedAt.toISOString() !== v.version) throw new CommunityError("El contenido cambió. Recargá antes de revisarlo.", 409);
    if (v.decision === "APPROVED" && (post.status === "CLOSED" || post.expiresAt <= new Date())) throw new CommunityError("Esta publicación está cerrada o vencida.", 409);
    await tx.communityPost.update({ where: { id: post.id }, data: { status: v.decision, reviewNote: v.note } });
    await tx.communityReview.create({ data: { postId: post.id, reviewerId: viewer.id, decision: v.decision, note: v.note } });
    await tx.communityReport.updateMany({ where: { postId: post.id, resolvedAt: null }, data: { resolvedAt: new Date() } });
  });
}
export async function reportPost(input: unknown, viewer: Viewer) {
  const v = z.object({ id: idSchema, reason: z.string().trim().min(10).max(500) }).parse(input);
  await rateLimit("report:" + viewer.id, 10, 3600000);
  const exists = await prisma.communityPost.findFirst({ where: { id: v.id, status: "APPROVED", expiresAt: { gt: new Date() } }, select: { id: true } });
  if (!exists) throw new CommunityError("La publicación ya no está disponible.", 404);
  await prisma.communityReport.upsert({ where: { postId_userId: { postId: v.id, userId: viewer.id } }, create: { postId: v.id, userId: viewer.id, reason: v.reason }, update: { reason: v.reason, resolvedAt: null } });
}
