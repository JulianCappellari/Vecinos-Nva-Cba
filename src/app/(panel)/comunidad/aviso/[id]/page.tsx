import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { currentUser } from "@/lib/community/auth";
import { getPost } from "@/lib/community/posts";
import { FEATURES, formatDate, formatMoney, idSchema } from "@/lib/community/schema";
import { PostActions, ReviewForm } from "@/components/community/PostActions";
import { STATUS } from "@/components/community/PostCard";
import { ServiceNotice } from "@/components/community/Listing";

export const metadata = { title: "Una propuesta para compartir", robots: { index: false, follow: true } };
export default async function DetailPage({ params }: { params: { id: string } }) {
  if (!idSchema.safeParse(params.id).success) notFound();
  let post, viewer;
  try { viewer = await currentUser(); post = await getPost(params.id, viewer); }
  catch { return <div className="community-container"><ServiceNotice /></div>; }
  if (!post) notFound();
  const feature = FEATURES.find(f => f.kind === post.kind)!, data = post.data as Record<string, unknown>;
  const reports = viewer?.role === "ADMIN" ? await prisma.communityReport.findMany({ where: { postId: post.id, resolvedAt: null }, select: { reason: true, createdAt: true }, orderBy: { createdAt: "asc" } }) : [];
  const attendees = post.mine || viewer?.role === "ADMIN" ? await prisma.communityParticipation.findMany({ where: { postId: post.id }, select: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } }) : [];
  const facts: [string, string][] = post.kind === "PLAN" ? [["Cuándo", formatDate(String(data.startsAt)) + " a " + formatDate(String(data.endsAt))], ["Dónde", String(data.location)], ["Costo por persona", formatMoney(Number(data.cost))], ["Cupos para participantes", post.participants + " de " + data.capacity]] :
    post.kind === "STUDY" ? [["Universidad", String(data.university)], ["Carrera", String(data.career)], ["Materia", String(data.subject)], ["Disponibilidad", String(data.availability)], ["Modalidad", String(data.modality)], ["Lugar / coordinación", String(data.location)], ["Compañeros inscriptos", post.participants + " de " + data.capacity]] :
    post.kind === "BENEFIT" ? [["Comercio / organización", String(data.merchant)], ["Dónde", String(data.location)], ["Precio final", formatMoney(Number(data.cost))], ["Vigente hasta", formatDate(String(data.expiresAt))], ["Condiciones", String(data.terms)]] :
    post.kind === "GROUP" ? [["Origen", String(data.province) + (data.city ? " · " + data.city : "")], ["Interés", post.category], ["Reglas del grupo", String(data.rules)]] :
    [["Tipo de aviso", String(data.operation)], ["Estado", String(data.condition)], ["Zona aproximada", String(data.zone)], ["Precio", data.operation === "Vendo" ? formatMoney(Number(data.price)) : data.operation === "Dono" ? "Sin costo" : "A convenir"]];
  return <div className="community-container community-detail"><Link className="c-text-button" href={"/comunidad/" + feature.slug}>← {feature.title}</Link><header><div className="community-row"><span className="c-tag">{post.category}</span>{post.mine || viewer?.role === "ADMIN" || post.joined ? <span>{STATUS[post.status]}</span> : null}</div><h1>{post.title}</h1><p>Comparte {post.author.name} · publicado el {formatDate(post.createdAt)}</p></header><div className="community-detail-grid"><div>{post.imageUrl ? <Image className="community-detail-image" src={post.imageUrl} alt={post.title} width={900} height={650} sizes="(max-width: 850px) 100vw, 60vw" /> : null}<p className="community-description">{post.description}</p><dl className="community-detail-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{attendees.length ? <section className="community-attendees"><h2>Quienes se sumaron</h2><p className="community-muted">Solo vos y el equipo pueden ver esta lista. No se comparten correos.</p><ul>{attendees.map((p, i) => <li key={i}>{p.user.name}</li>)}</ul></section> : null}</div><aside><PostActions post={post} viewer={viewer} /><p className="community-footnote">Las propuestas son de quienes las publican. Consultá los detalles antes de asistir o coordinar una entrega. Horarios en hora de Córdoba.</p></aside></div>{viewer?.role === "ADMIN" ? <ReviewForm post={post} reports={reports.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))} /> : null}</div>;
}
