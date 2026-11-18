"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PROVINCES, safeReturnPath } from "@/lib/community/schema";
import { communityAction } from "@/lib/community/client";
import type { Viewer } from "@/lib/community/types";

export function Account({ user, returnTo }: { user: Viewer | null; returnTo?: string }) {
  const [register, setRegister] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState(""), [success, setSuccess] = useState(false);
  const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const f = new FormData(event.currentTarget);
    const result = await communityAction(user ? "password" : register ? "register" : "login", user ? { current: f.get("current"), password: f.get("password") } : { name: f.get("name"), email: f.get("email"), password: f.get("password"), ...(f.get("province") ? { province: f.get("province") } : {}) });
    setBusy(false); setSuccess(result.ok); setMessage(result.message);
    if (result.ok && !user) { router.replace(safeReturnPath(returnTo)); router.refresh(); }
    if (result.ok && user) (event.target as HTMLFormElement).reset();
  }
  async function logout() { setBusy(true); const result = await communityAction("logout"); setBusy(false); if (result.ok) { router.replace("/comunidad"); router.refresh(); } else setMessage(result.message); }
  return <div className="community-account">
    <div><h1>{user ? "Tu lugar en la comunidad." : register ? "Empezá a hacer barrio." : "Qué bueno verte por acá."}</h1><p>{user ? "Hola, " + user.name + ". Desde acá podés gestionar tu cuenta y tus publicaciones." : "Una cuenta para proponer planes, encontrar compañeros y compartir lo que necesitás."}</p>
      <p className="community-muted">Tu correo es privado. En las publicaciones se muestra el nombre que elijas. Compartís un contacto únicamente cuando publicás y lo autorizás.</p>
      {user ? <div className="community-actions"><Link className="c-button" href="/comunidad/mis-publicaciones">Mis publicaciones e inscripciones</Link>{user.role === "ADMIN" ? <Link className="c-button secondary" href="/comunidad/moderacion">Revisar publicaciones</Link> : null}<button className="c-button secondary" disabled={busy} onClick={logout}>Cerrar sesión</button></div> : null}
    </div>
    <form className="community-form" onSubmit={submit}>
      {user ? <h2>Cambiar contraseña</h2> : <div className="community-switch" role="group" aria-label="Acceso"><button type="button" aria-pressed={!register} onClick={() => {setRegister(false);setMessage("");}}>Ingresar</button><button type="button" aria-pressed={register} onClick={() => {setRegister(true);setMessage("");}}>Crear cuenta</button></div>}
      {register && !user ? <label>Cómo querés que te llamen<input name="name" autoComplete="nickname" minLength={2} maxLength={40} required /></label> : null}
      {!user ? <label>Correo electrónico<input name="email" type="email" autoComplete="email" maxLength={254} required /></label> : <label>Contraseña actual<input name="current" type="password" autoComplete="current-password" maxLength={128} required /></label>}
      <label>{user ? "Nueva contraseña" : "Contraseña"}<input name="password" type="password" autoComplete={register || user ? "new-password" : "current-password"} minLength={10} maxLength={128} required aria-describedby="password-help" /></label>
      <p id="password-help" className="community-muted">Usá al menos 10 caracteres. No compartas tu contraseña.</p>
      {register && !user ? <label>De dónde venís <span className="community-muted">(opcional)</span><select name="province"><option value="">Prefiero no decirlo</option>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></label> : null}
      {message ? <p className={"c-notice " + (success ? "success" : "error")} role="status">{message}</p> : null}
      <button className="c-button" disabled={busy}>{busy ? "Un momento…" : user ? "Guardar contraseña" : register ? "Crear mi cuenta" : "Ingresar"}</button>
    </form>
  </div>;
}
