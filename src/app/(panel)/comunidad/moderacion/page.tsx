import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/community/auth";
import { Listing, ServiceNotice, type SearchParams } from "@/components/community/Listing";
export const metadata = { title: "Moderación", robots: { index: false, follow: false } };
export default async function ModerationPage({ searchParams }: { searchParams: SearchParams }) {
  let user; try { user = await currentUser(); } catch { return <div className="community-container"><ServiceNotice /></div>; }
  if (!user) redirect("/comunidad/cuenta?volver=/comunidad/moderacion");
  if (user.role !== "ADMIN") notFound();
  const reports = searchParams.vista === "reportes";
  return <div className="community-container"><header className="community-page-heading"><div><h1>Cuidemos la comunidad.</h1><p>Abrí una publicación para revisar sus datos, aprobarla o pedir cambios.</p></div></header><nav className="community-subnav" aria-label="Revisión"><Link href="/comunidad/moderacion" aria-current={!reports ? "page" : undefined}>Pendientes</Link><Link href="/comunidad/moderacion?vista=reportes" aria-current={reports ? "page" : undefined}>Reportes</Link></nav><Listing searchParams={searchParams} scope={reports ? "reports" : "moderation"} /></div>;
}
