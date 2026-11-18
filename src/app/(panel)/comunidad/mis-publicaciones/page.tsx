import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/community/auth";
import { Listing, ServiceNotice, type SearchParams } from "@/components/community/Listing";
export const metadata = { title: "Mi actividad", robots: { index: false, follow: false } };
export default async function ActivityPage({ searchParams }: { searchParams: SearchParams }) {
  let user; try { user = await currentUser(); } catch { return <div className="community-container"><ServiceNotice /></div>; }
  if (!user) redirect("/comunidad/cuenta?volver=/comunidad/mis-publicaciones");
  const joined = searchParams.vista === "inscripciones";
  return <div className="community-container"><header className="community-page-heading"><div><h1>Lo que estás armando.</h1><p>Tus propuestas, tus encuentros y los próximos pasos.</p></div><Link className="c-button" href="/comunidad/publicar">Crear una publicación</Link></header><nav className="community-subnav" aria-label="Mi actividad"><Link href="/comunidad/mis-publicaciones" aria-current={!joined ? "page" : undefined}>Mis publicaciones</Link><Link href="/comunidad/mis-publicaciones?vista=inscripciones" aria-current={joined ? "page" : undefined}>Mis inscripciones</Link></nav><Listing searchParams={searchParams} scope={joined ? "joined" : "mine"} /></div>;
}
