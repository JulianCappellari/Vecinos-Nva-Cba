import Link from "next/link";
import { z } from "zod";
import { CATEGORIES, FEATURES, PROVINCES, type PostKind } from "@/lib/community/schema";
import { currentUser } from "@/lib/community/auth";
import { filtersSchema, listPosts, type PostFilters } from "@/lib/community/posts";
import type { ListingResult } from "@/lib/community/types";
import { PostCard } from "./PostCard";
import { Reveal } from "../ui/motion";

export type SearchParams = Record<string, string | string[] | undefined>;
export function cleanParams(input: SearchParams) {
  return Object.fromEntries(Object.entries(input).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim() !== ""));
}
export function ServiceNotice() {
  return <div className="c-notice error" role="status"><strong>No pudimos cargar las publicaciones.</strong><p>Intentá de nuevo en unos minutos. Tu guía para recién llegados sigue disponible.</p><Link href="/comunidad/bienvenida">Abrir mi guía</Link></div>;
}
export function BudgetGuide() {
  return <section className="budget-guide"><h2>Ideas que cuidan el bolsillo</h2><div><article><h3>Un plan sin entrada</h3><p>Buscá encuentros gratuitos y proponé llevar mate o juegos para compartir.</p><Link href="/comunidad/planes?maxCost=0">Ver planes gratuitos →</Link></article><article><h3>Antes de comprar, buscá</h3><p>Libros, muebles y cosas para la casa que otro estudiante ya no necesita.</p><Link href="/comunidad/intercambio?operation=Dono">Explorar donaciones →</Link></article><article><h3>Compartí una mesa de estudio</h3><p>Encontrá compañeros para preparar una materia. Acordá el lugar y los materiales con el grupo.</p><Link href="/comunidad/estudio">Encontrar compañeros →</Link></article></div><p className="community-muted">Las ideas son orientativas. Los beneficios de abajo indican precio, condiciones y fecha de vencimiento.</p></section>;
}
export async function Listing({ kind, searchParams, scope = "public" }: { kind?: PostKind; searchParams: SearchParams; scope?: "public" | "mine" | "joined" | "moderation" | "reports" }) {
  const params = cleanParams(searchParams);
  let result: ListingResult; let error = "";
  try {
    const viewer = await currentUser();
    const filters = filtersSchema.parse({ ...params, kind, scope });
    result = await listPosts(filters as PostFilters, viewer);
  } catch (e) {
    result = { posts: [], page: 1, pages: 0, total: 0 };
    error = e instanceof z.ZodError ? "Hay un filtro inválido. Limpiá los filtros y volvé a buscar." : "unavailable";
  }
  const feature = FEATURES.find(f => f.kind === kind);
  const path = scope === "mine" || scope === "joined" ? "/comunidad/mis-publicaciones" : scope === "moderation" || scope === "reports" ? "/comunidad/moderacion" : "/comunidad/" + feature?.slug;
  function pageHref(page: number) { const p = new URLSearchParams(params); p.set("page", String(page)); return path + "?" + p; }
  return <section className="community-listing" aria-label="Publicaciones">
    {scope === "public" && kind ? <form className="community-filters" action={path} method="get">
      <label className="filter-search">¿Qué estás buscando?<input name="q" defaultValue={params.q} maxLength={100} placeholder={kind === "STUDY" ? "Una materia, una carrera…" : "Buscá por nombre o palabra…"} type="search" /></label>
      <label>Categoría<select name="category" defaultValue={params.category || ""}><option value="">Todas</option>{CATEGORIES[kind].map(c => <option key={c}>{c}</option>)}</select></label>
      {kind === "GROUP" ? <label>Provincia<select name="province" defaultValue={params.province || ""}><option value="">Todo el país</option>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></label> : null}
      {kind === "STUDY" ? <><label>Universidad<input name="university" defaultValue={params.university} placeholder="Tu universidad" maxLength={100} /></label><label>Carrera<input name="career" defaultValue={params.career} placeholder="Tu carrera" maxLength={100} /></label><label>Materia<input name="subject" defaultValue={params.subject} placeholder="Tu próxima materia" maxLength={100} /></label></> : null}
      {kind === "PLAN" ? <label>Fecha<input name="date" type="date" defaultValue={params.date} /></label> : null}
      {kind === "PLAN" || kind === "BENEFIT" ? <label>Hasta $ (ARS)<input name="maxCost" type="number" min="0" max="10000000" step="1" defaultValue={params.maxCost} placeholder="Sin límite" /></label> : null}
      {kind === "EXCHANGE" ? <label>Tipo de aviso<select name="operation" defaultValue={params.operation || ""}><option value="">Todos</option>{["Vendo", "Dono", "Intercambio"].map(o => <option key={o}>{o}</option>)}</select></label> : null}
      <div className="filter-actions"><button className="c-button" type="submit">Buscar</button><Link className="c-text-button" href={path}>Limpiar</Link></div>
    </form> : null}
    {error === "unavailable" ? <ServiceNotice /> : error ? <div className="c-notice error" role="status">{error} <Link href={path}>Limpiar filtros</Link></div> : <>
      <div className="community-row listing-summary"><p aria-live="polite">{result.total} {result.total === 1 ? "publicación" : "publicaciones"}{Object.keys(params).some(k => !["page", "vista"].includes(k)) ? " con estos filtros" : ""}</p>{scope === "public" && feature ? <Link className="c-text-button" href={"/comunidad/publicar?tipo=" + kind}>{feature.action} →</Link> : null}</div>
      {result.posts.length ? <Reveal stagger variant="pop" className="community-post-grid">{result.posts.map(post => <PostCard key={post.id} post={post} showStatus={scope !== "public"} />)}</Reveal> : <div className="community-empty"><h2>{scope === "joined" ? "Tu próximo encuentro te espera." : scope === "moderation" || scope === "reports" ? "Todo al día por acá." : "Este espacio también lo armás vos."}</h2><p>{scope === "joined" ? "Cuando te sumes a un plan o a una mesa de estudio, lo vas a encontrar acá." : scope === "moderation" || scope === "reports" ? "No hay publicaciones para revisar en esta sección." : "Todavía no hay publicaciones para mostrar con estos filtros. Podés probar otra búsqueda o compartir la primera propuesta."}</p><Link className="c-button secondary" href={scope === "joined" ? "/comunidad/planes" : scope === "moderation" || scope === "reports" ? "/comunidad" : "/comunidad/publicar" + (kind ? "?tipo=" + kind : "")}>{scope === "joined" ? "Encontrar un plan" : scope === "moderation" || scope === "reports" ? "Explorar comunidad" : "Crear una publicación"}</Link></div>}
      {result.pages > 1 ? <nav className="community-pagination" aria-label="Páginas de publicaciones">{result.page > 1 ? <Link href={pageHref(result.page - 1)}>← Anterior</Link> : <span />}<span>Página {result.page} de {result.pages}</span>{result.page < result.pages ? <Link href={pageHref(result.page + 1)}>Siguiente →</Link> : <span />}</nav> : null}
    </>}
    {kind === "GROUP" ? <p className="community-footnote">También podés explorar los <Link href="/grupos">grupos del directorio del barrio</Link>. No les asignamos una provincia si quien organiza no la indicó.</p> : null}
  </section>;
}
