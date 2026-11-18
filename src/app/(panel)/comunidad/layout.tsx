import Link from "next/link";
import { currentUser } from "@/lib/community/auth";
import { FeatureNav } from "@/components/community/CommunityNav";
import "./comunidad.css";

export const dynamic = "force-dynamic";
export const metadata = { title: { default: "Comunidad estudiantil | Vecinos de Nueva Córdoba", template: "%s | Comunidad Nueva Córdoba" }, description: "Planes para conocer gente, compañeros de estudio y una guía para hacer tuyo el barrio." };
export default async function CommunityLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser().catch(() => null);
  return <div className="community-shell"><a className="community-skip" href="#community-content">Saltar al contenido de la comunidad</a><header className="community-top"><Link href="/comunidad" className="community-wordmark">Hacé barrio<span>Vecinos de Nueva Córdoba</span></Link><div className="community-account-links">{user ? <><Link href="/comunidad/mis-publicaciones">Mi actividad</Link>{user.role === "ADMIN" ? <Link href="/comunidad/moderacion">Moderación</Link> : null}</> : null}<Link href="/comunidad/cuenta" className="community-account-link">{user ? user.name : "Ingresar"}</Link></div></header><FeatureNav /><div id="community-content" tabIndex={-1}>{children}</div></div>;
}
