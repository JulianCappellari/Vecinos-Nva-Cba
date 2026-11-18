import Link from "next/link";
import Image from "next/image";
import { IoArrowForwardOutline, IoCalendarOutline, IoLocationOutline, IoPeopleOutline, IoSchoolOutline } from "react-icons/io5";
import { FEATURES, formatDate, formatMoney, type PostInput } from "@/lib/community/schema";
import type { CommunityPost } from "@/lib/community/types";

export const STATUS: Record<string, string> = { PENDING: "En revisión", APPROVED: "Publicada", REJECTED: "Revisar cambios", CLOSED: "Cerrada" };
export function PostCard({ post, showStatus = false }: { post: CommunityPost; showStatus?: boolean }) {
  const data = post.data as Record<string, unknown>;
  const expired = new Date(post.expiresAt) <= new Date();
  const feature = FEATURES.find(f => f.kind === post.kind)!;
  return <article className="community-post" data-kind={post.kind}>
    {post.imageUrl ? <div className="community-post-image"><Image src={post.imageUrl} alt={post.title} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 380px" /></div> : null}
    <div className="community-post-content"><div className="community-row"><span className="c-tag">{post.category}</span>{showStatus ? <span className="community-status">{expired ? "Vencida" : STATUS[post.status]}</span> : null}</div>
      <h2><Link href={"/comunidad/aviso/" + post.id}>{post.title}</Link></h2>
      <p className="community-post-description">{post.description}</p>
      <ul className="community-facts">
        {post.kind === "PLAN" ? <><li><IoCalendarOutline aria-hidden="true" />{formatDate(String(data.startsAt))}</li><li><IoLocationOutline aria-hidden="true" />{String(data.location)}</li><li><IoPeopleOutline aria-hidden="true" />{post.participants} de {Number(data.capacity)} cupos · podés venir solo</li></> : null}
        {post.kind === "STUDY" ? <><li><IoSchoolOutline aria-hidden="true" />{String(data.university)} · {String(data.subject)}</li><li>{String(data.modality)} · {String(data.availability)}</li><li><IoPeopleOutline aria-hidden="true" />{post.participants} de {Number(data.capacity)} cupos</li></> : null}
        {post.kind === "GROUP" ? <><li>{String(data.province)}{data.city ? " · " + data.city : ""}</li><li>Grupo de WhatsApp · {post.category}</li></> : null}
        {post.kind === "BENEFIT" ? <><li>{String(data.merchant)}</li><li>Hasta {formatDate(String(data.expiresAt))}</li></> : null}
        {post.kind === "EXCHANGE" ? <><li>{String(data.operation)} · {String(data.condition)}</li><li><IoLocationOutline aria-hidden="true" />{String(data.zone)}</li></> : null}
      </ul>
      <div className="community-post-bottom"><span>{post.kind === "PLAN" || post.kind === "BENEFIT" ? formatMoney(Number(data.cost)) : post.kind === "EXCHANGE" ? data.operation === "Dono" ? "Sin costo" : data.operation === "Intercambio" ? "A convenir" : formatMoney(Number(data.price)) : feature.title}</span><Link href={"/comunidad/aviso/" + post.id} aria-label={"Ver " + post.title}>Ver más <IoArrowForwardOutline aria-hidden="true" /></Link></div>
      {post.joined ? <p className="community-joined">Ya te sumaste a este encuentro.</p> : null}
    </div>
  </article>;
}
