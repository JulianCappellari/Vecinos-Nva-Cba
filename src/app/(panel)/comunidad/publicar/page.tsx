import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/community/auth";
import { getPost } from "@/lib/community/posts";
import { idSchema, KINDS, type PostKind } from "@/lib/community/schema";
import { PostForm } from "@/components/community/PostForm";
import { ServiceNotice } from "@/components/community/Listing";

export const metadata = { title: "Compartir una propuesta", robots: { index: false, follow: false } };
export default async function PublishPage({ searchParams }: { searchParams: { tipo?: string; editar?: string } }) {
  let user;
  try { user = await currentUser(); } catch { return <div className="community-container"><ServiceNotice /></div>; }
  const kind = KINDS.includes(searchParams.tipo as PostKind) ? searchParams.tipo as PostKind : "PLAN";
  if (!user) redirect("/comunidad/cuenta?volver=" + encodeURIComponent("/comunidad/publicar?tipo=" + kind + (searchParams.editar ? "&editar=" + searchParams.editar : "")));
  const initial = searchParams.editar && idSchema.safeParse(searchParams.editar).success ? await getPost(searchParams.editar, user) : undefined;
  if (searchParams.editar && (!initial || !initial.mine)) notFound();
  return <div className="community-container community-form-page"><Link className="c-text-button" href="/comunidad">← Volver a la comunidad</Link><h1>{initial ? "Tu propuesta, al día." : "Compartí algo bueno."}</h1><p>Una idea simple puede ser el comienzo de algo compartido.</p><PostForm initialKind={kind} initial={initial || undefined} /></div>;
}
