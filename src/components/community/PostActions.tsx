"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { communityAction } from "@/lib/community/client";
import type { CommunityPost, Viewer } from "@/lib/community/types";

export function PostActions({ post, viewer }: { post: CommunityPost; viewer: Viewer | null }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [report, setReport] = useState(false), [confirmClose, setConfirmClose] = useState(false);
  const router = useRouter();
  const data = post.data as Record<string, unknown>, joinable = post.kind === "PLAN" || post.kind === "STUDY";
  const published = post.status === "APPROVED" && new Date(post.expiresAt) > new Date();
  const active = published && (post.kind !== "PLAN" || new Date(String(data.startsAt)) > new Date());
  async function act(action: string, payload: unknown) {
    if (busy) return; setBusy(true); setMessage("");
    const result = await communityAction(action, payload); setBusy(false); setMessage(result.message);
    if (result.ok) {
      if (action === "report") setReport(false);
      if (action === "close" || (action === "participate" && post.joined && !active && !post.mine)) router.push("/comunidad/mis-publicaciones");
      router.refresh();
    }
  }
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: post.title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setMessage("Copiaste el enlace. Ya lo podés compartir."); }
    } catch (e) { if ((e as Error).name !== "AbortError") setMessage("Podés copiar el enlace desde la barra de direcciones."); }
  }
  async function reportSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await act("report", { id: post.id, reason: new FormData(event.currentTarget).get("reason") }); }
  return <div className="community-detail-actions">
    {post.joined ? <p className="c-notice success">Ya te sumaste. Si no podés ir, liberá tu cupo para otra persona.</p> : null}
    <div className="community-actions">
      {joinable && !post.mine && (active || post.joined) ? viewer ? <button className="c-button" disabled={busy || (!post.joined && post.participants >= Number(data.capacity))} onClick={() => act("participate", { id: post.id, join: !post.joined })}>{busy ? "Actualizando…" : post.joined ? "Liberar mi cupo" : post.participants >= Number(data.capacity) ? "Cupos completos" : "Me sumo"}</button> : <Link className="c-button" href={"/comunidad/cuenta?volver=" + encodeURIComponent("/comunidad/aviso/" + post.id)}>Ingresar para sumarme</Link> : null}
      {active && post.kind === "GROUP" && post.groupUrl ? <a className="c-button" href={post.groupUrl} target="_blank" rel="noopener noreferrer">Ir al grupo de WhatsApp ↗</a> : null}
      {published && post.contactUrl ? <a className={"c-button " + (joinable || post.kind === "GROUP" ? "secondary" : "")} href={post.contactUrl} target="_blank" rel="noopener noreferrer">{post.kind === "PLAN" || post.kind === "STUDY" ? "Consultar a quien organiza" : "Consultar por WhatsApp"} ↗</a> : null}
      <button className="c-button secondary" type="button" onClick={share}>Compartir</button>
    </div>
    {joinable && !post.mine ? <p className="community-muted">Al sumarte, quien organiza puede ver el nombre que elegiste. Tu correo permanece privado. Coordiná los detalles por el contacto publicado.</p> : null}
    {post.mine ? <div className="community-owner-tools"><h2>Tu publicación</h2><p>Estado: {post.status === "PENDING" ? "en revisión" : post.status === "APPROVED" ? "aprobada" : post.status === "REJECTED" ? "requiere cambios" : "cerrada"}.</p>{post.reviewNote ? <p className="c-notice">Mensaje del equipo: {post.reviewNote}</p> : null}
      <div className="community-actions">{post.participants === 0 ? <Link className="c-button secondary" href={"/comunidad/publicar?editar=" + post.id}>Editar y enviar a revisión</Link> : <p className="community-muted">Hay personas inscriptas. Para cambiar los datos, cerrá este encuentro y creá otro.</p>}{post.status !== "CLOSED" ? <button className="c-text-button" disabled={busy} onClick={() => setConfirmClose(true)}>{post.kind === "EXCHANGE" ? "Marcar como resuelto" : "Cerrar publicación"}</button> : null}</div>
      {confirmClose ? <div className="c-notice"><p>La publicación dejará de aparecer. Las personas inscriptas verán que se cerró.</p><div className="community-actions"><button className="c-button" disabled={busy} onClick={() => act("close", { id: post.id })}>Confirmar cierre</button><button className="c-text-button" onClick={() => setConfirmClose(false)}>Volver</button></div></div> : null}
    </div> : active ? <div className="community-report"><button className="c-text-button" type="button" onClick={() => setReport(!report)} aria-expanded={report}>Reportar esta publicación</button>{report ? viewer ? <form onSubmit={reportSubmit}><label>Qué deberíamos revisar<textarea name="reason" minLength={10} maxLength={500} rows={3} required placeholder="Contanos el problema sin incluir datos personales de otras personas." /></label><button className="c-button secondary" disabled={busy}>Enviar reporte</button></form> : <p><Link href={"/comunidad/cuenta?volver=" + encodeURIComponent("/comunidad/aviso/" + post.id)}>Ingresá</Link> para enviar un reporte.</p> : null}</div> : null}
    {message ? <p className="c-notice" role="status">{message}</p> : null}
  </div>;
}
export function ReviewForm({ post, reports }: { post: CommunityPost; reports: { reason: string; createdAt: string }[] }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); const f = new FormData(event.currentTarget);
    const result = await communityAction("review", { id: post.id, version: post.updatedAt, decision: f.get("decision"), note: f.get("note") });
    setBusy(false); setMessage(result.message); if (result.ok) { router.push("/comunidad/moderacion"); router.refresh(); }
  }
  return <section className="community-review"><h2>Revisión del equipo</h2><p>Contacto autorizado: {post.contact}. Revisá contenido, fecha, lugar y condiciones antes de publicar.</p>
    {reports.length ? <><h3>Reportes pendientes</h3><ul>{reports.map((r, i) => <li key={i}>{r.reason}</li>)}</ul></> : null}
    <form className="community-form" onSubmit={submit}><label>Decisión<select name="decision" defaultValue="APPROVED"><option value="APPROVED">Aprobar / mantener publicada</option><option value="REJECTED">Pedir cambios</option><option value="CLOSED">Cerrar / retirar</option></select></label><label>Motivo para quien publicó<textarea name="note" minLength={5} maxLength={500} rows={3} required /></label><p className="community-muted">La decisión queda en el historial y resuelve los reportes pendientes de esta publicación.</p>{message ? <p className="c-notice" role="status">{message}</p> : null}<button className="c-button" disabled={busy}>{busy ? "Guardando…" : "Guardar revisión"}</button></form>
  </section>;
}
