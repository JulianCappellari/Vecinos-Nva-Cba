"use client";
import { FormEvent, ReactNode, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, FEATURES, KINDS, PROVINCES, type PostKind } from "@/lib/community/schema";
import type { CommunityPost } from "@/lib/community/types";
import { communityAction } from "@/lib/community/client";

function Field({ name, label, children, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; children?: ReactNode }) {
  return <label>{label}{children || <input name={name} {...props} />}</label>;
}
const localDate = (value: unknown) => typeof value === "string" ? new Date(new Date(value).getTime() - 3 * 3600000).toISOString().slice(0, 16) : "";
export function PostForm({ initialKind = "PLAN", initial }: { initialKind?: PostKind; initial?: CommunityPost }) {
  const [kind, setKind] = useState<PostKind>(initial?.kind || initialKind), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const [image, setImage] = useState({ id: initial?.imageId || "", url: initial?.imageUrl || "" });
  const [message, setMessage] = useState(""), [photoMessage, setPhotoMessage] = useState("");
  const [operation, setOperation] = useState(String((initial?.data as Record<string, unknown> | undefined)?.operation || "Vendo"));
  const key = useRef<string>(""), router = useRouter(), data = (initial?.data || {}) as Record<string, unknown>;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || uploading) return;
    setMessage(""); setBusy(true);
    const f = new FormData(event.currentTarget);
    const str = (name: string) => String(f.get(name) || "").trim(), num = (name: string) => Number(f.get(name) || 0);
    const date = (name: string) => new Date(str(name) + "-03:00").toISOString();
    try {
      const details = kind === "PLAN" ? { startsAt: date("startsAt"), endsAt: date("endsAt"), capacity: num("capacity"), location: str("location"), cost: num("cost"), welcomeSolo: f.get("welcomeSolo") === "on" } :
        kind === "STUDY" ? { university: str("university"), career: str("career"), subject: str("subject"), availability: str("availability"), modality: str("modality"), location: str("location"), capacity: num("capacity") } :
        kind === "BENEFIT" ? { merchant: str("merchant"), location: str("location"), cost: num("cost"), terms: str("terms"), expiresAt: date("expiresAt") } :
        kind === "GROUP" ? { province: str("province"), city: str("city"), rules: str("rules"), url: str("url") } :
        { operation: str("operation"), condition: str("condition"), price: str("operation") === "Vendo" ? num("price") : 0, zone: str("zone") };
      key.current ||= crypto.randomUUID();
      const result = await communityAction("save", { post: { kind, title: str("title"), description: str("description"), category: str("category"), contact: str("contact"), contactConsent: f.get("contactConsent") === "on", ...(image.id ? { imageId: image.id } : {}), data: details }, ...(initial ? { id: initial.id, version: initial.updatedAt } : { submissionKey: key.current }) });
      if (result.ok && result.id) { router.push("/comunidad/aviso/" + result.id); router.refresh(); } else setMessage(result.message);
    } catch { setMessage("Revisá las fechas y los campos antes de enviar."); }
    finally { setBusy(false); }
  }
  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {setPhotoMessage("Elegí una foto JPG, PNG o WebP de hasta 2 MB.");return;}
    setUploading(true); setPhotoMessage("");
    try { const form = new FormData(); form.append("image", file); const response = await fetch("/api/comunidad/imagen", { method: "POST", body: form }); const result = await response.json(); if (!response.ok) throw new Error(result.message); setImage({ id: result.imageId, url: result.url }); } catch (e) { setPhotoMessage(e instanceof Error ? e.message : "No se pudo cargar la foto."); } finally { setUploading(false); }
  }
  return <form className="community-form community-post-form" onSubmit={submit}>
    <p className="c-notice">Tu publicación se revisa antes de aparecer. Elegí un lugar público para encontrarte y compartí solo los datos necesarios.</p>
    <div className="form-grid">
      <label>¿Qué querés compartir?<select value={kind} disabled={!!initial || busy} onChange={e => setKind(e.target.value as PostKind)}>{KINDS.map(k => <option key={k} value={k}>{FEATURES.find(f => f.kind === k)!.title}</option>)}</select></label>
      <label>Categoría<select key={kind} name="category" defaultValue={initial?.category} required>{CATEGORIES[kind].map(c => <option key={c}>{c}</option>)}</select></label>
    </div>
    <Field name="title" label="Título" defaultValue={initial?.title} minLength={6} maxLength={100} placeholder={kind === "STUDY" ? "Una mesa para preparar el próximo final" : "Contá la propuesta en una frase"} required />
    <label>Contanos un poco más<textarea name="description" defaultValue={initial?.description} minLength={20} maxLength={1600} rows={4} required placeholder="Qué proponés, qué hace falta y qué debería saber quien se sume." /></label>
    <fieldset className="community-fields" key={kind}><legend>{FEATURES.find(f => f.kind === kind)!.title}</legend>
      {kind === "PLAN" ? <><div className="form-grid"><Field name="startsAt" label="Empieza (hora de Córdoba)" type="datetime-local" defaultValue={localDate(data.startsAt)} required /><Field name="endsAt" label="Termina (hora de Córdoba)" type="datetime-local" defaultValue={localDate(data.endsAt)} required /></div><Field name="location" label="Punto de encuentro público" defaultValue={String(data.location || "")} minLength={5} maxLength={180} placeholder="Nombre del lugar y punto de encuentro" required /><div className="form-grid"><Field name="capacity" label="Cupos para participantes (sin contarte)" type="number" min={2} max={50} defaultValue={Number(data.capacity || 6)} required /><Field name="cost" label="Costo por persona, ARS (0 = gratis)" type="number" min={0} max={1000000} step={1} defaultValue={Number(data.cost || 0)} required /></div><label className="c-checkbox"><input name="welcomeSolo" type="checkbox" defaultChecked={data.welcomeSolo === true} required /><span>Quienes vengan solos son bienvenidos. Voy a recibir al grupo.</span></label></> : null}
      {kind === "STUDY" ? <><div className="form-grid"><Field name="university" label="Universidad o institución" defaultValue={String(data.university || "")} minLength={2} maxLength={100} required /><Field name="career" label="Carrera" defaultValue={String(data.career || "")} minLength={2} maxLength={100} required /></div><Field name="subject" label="Materia" defaultValue={String(data.subject || "")} minLength={2} maxLength={100} required /><Field name="availability" label="Días y horarios para estudiar" defaultValue={String(data.availability || "")} minLength={5} maxLength={200} placeholder="Por ejemplo: martes por la tarde" required /><div className="form-grid"><label>Modalidad<select name="modality" defaultValue={String(data.modality || "Presencial")}>{["Presencial", "Virtual", "Mixto"].map(v => <option key={v}>{v}</option>)}</select></label><Field name="capacity" label="Cupos para compañeros (sin contarte)" type="number" min={2} max={20} defaultValue={Number(data.capacity || 4)} required /></div><Field name="location" label="Lugar público o cómo se coordina la reunión virtual" defaultValue={String(data.location || "")} minLength={2} maxLength={180} required /></> : null}
      {kind === "BENEFIT" ? <><Field name="merchant" label="Comercio u organización" defaultValue={String(data.merchant || "")} minLength={2} maxLength={100} required /><Field name="location" label="Dónde se usa" defaultValue={String(data.location || "")} minLength={5} maxLength={180} required /><div className="form-grid"><Field name="cost" label="Precio final, ARS (0 = gratis)" type="number" min={0} max={1000000} step={1} defaultValue={Number(data.cost || 0)} required /><Field name="expiresAt" label="Válido hasta (hora de Córdoba)" type="datetime-local" defaultValue={localDate(data.expiresAt)} required /></div><label>Condiciones<textarea name="terms" defaultValue={String(data.terms || "")} minLength={10} maxLength={800} rows={3} required placeholder="Qué incluye, horarios, requisitos y límites. Aclarar si se necesita credencial estudiantil." /></label></> : null}
      {kind === "GROUP" ? <><div className="form-grid"><label>Provincia o lugar de origen<select name="province" defaultValue={String(data.province || "")} required><option value="">Elegí una opción</option>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></label><Field name="city" label="Ciudad (opcional)" defaultValue={String(data.city || "")} maxLength={100} /></div><Field name="url" label="Invitación al grupo de WhatsApp" type="url" defaultValue={String(data.url || "")} placeholder="https://chat.whatsapp.com/…" maxLength={400} required /><label>Reglas y bienvenida<textarea name="rules" defaultValue={String(data.rules || "")} minLength={15} maxLength={800} rows={3} required placeholder="Para quién es, qué se comparte y cómo cuidan la convivencia." /></label></> : null}
      {kind === "EXCHANGE" ? <><div className="form-grid"><label>Qué querés hacer<select name="operation" value={operation} onChange={e => setOperation(e.target.value)}>{["Vendo", "Dono", "Intercambio"].map(o => <option key={o}>{o}</option>)}</select></label><label>Estado del artículo<select name="condition" defaultValue={String(data.condition || "Usado")}>{["Nuevo", "Muy bueno", "Usado"].map(o => <option key={o}>{o}</option>)}</select></label></div>{operation === "Vendo" ? <Field name="price" label="Precio, ARS" type="number" min={1} max={10000000} step={1} defaultValue={Number(data.price || 1)} required /> : null}<Field name="zone" label="Zona de entrega aproximada" defaultValue={String(data.zone || "")} minLength={3} maxLength={100} placeholder="Por ejemplo: Nueva Córdoba, cerca de Plaza España" required /><p className="community-muted">Describí el estado real y acordá la entrega en un lugar público. La coordinación se hace directamente entre las personas.</p></> : null}
    </fieldset>
    <label>Foto (opcional, hasta 2 MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || busy} onChange={e => upload(e.target.files?.[0])} /></label>
    {uploading ? <p role="status">Cargando foto…</p> : null}{photoMessage ? <p className="c-notice error" role="status">{photoMessage}</p> : null}
    {image.url ? <div className="community-image-preview"><Image src={image.url} alt="Vista previa de tu publicación" width={400} height={250} /><button type="button" className="c-text-button" onClick={() => setImage({id:"",url:""})} disabled={uploading || busy}>Quitar foto</button></div> : null}
    <Field name="contact" label="WhatsApp de contacto con código de país" type="tel" defaultValue={initial?.contact} minLength={10} maxLength={22} placeholder="Código de país + número, solo dígitos" required />
    <label className="c-checkbox"><input name="contactConsent" type="checkbox" required /><span>Autorizo a mostrar este contacto en la publicación aprobada. Soy responsable de la propuesta y puedo compartir sus datos y su foto.</span></label>
    {message ? <p className="c-notice error" role="alert">{message}</p> : null}
    <div className="community-actions"><button className="c-button" type="submit" disabled={busy || uploading}>{busy ? "Guardando…" : "Enviar a revisión"}</button><Link className="c-text-button" href="/comunidad/mis-publicaciones">Volver a mis publicaciones</Link></div>
    <p className="community-muted">Planes: hasta que finalicen. Beneficios: hasta su vencimiento. Avisos y mesas de estudio: 30 días. Grupos: 90 días. Las ediciones vuelven a revisión.</p>
  </form>;
}
