"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FEATURES } from "@/lib/community/schema";
import { IoArrowForwardOutline, IoBookOutline, IoCompassOutline, IoHeartOutline, IoPeopleOutline, IoPricetagOutline, IoSwapHorizontalOutline } from "react-icons/io5";
const ICONS = [IoPeopleOutline, IoBookOutline, IoCompassOutline, IoPricetagOutline, IoHeartOutline, IoSwapHorizontalOutline];
export function FeatureNav() {
  const path = usePathname();
  return <nav className="community-tabs" aria-label="Vida estudiantil"><Link href="/comunidad" aria-current={path === "/comunidad" ? "page" : undefined}>Explorar</Link>{FEATURES.map((f, i) => { const Icon = ICONS[i]; return <Link key={f.slug} href={"/comunidad/" + f.slug} aria-current={path === "/comunidad/" + f.slug ? "page" : undefined}><Icon aria-hidden="true" />{f.slug === "intercambio" ? "Intercambio" : f.title}</Link>; })}</nav>;
}
export function CommunityEntry() {
  return <section className="aurora bg-celeste-950 px-5 py-20 text-white sm:px-8 md:py-28">
    <div className="mx-auto max-w-6xl">
      <h2 className="max-w-3xl font-[family-name:var(--font-anton)] text-[clamp(2.25rem,6vw,4.5rem)] uppercase leading-none text-sol">Tu próxima historia empieza acá.</h2>
      <p className="mt-5 max-w-2xl text-lg text-sky-100">Llegaste a estudiar. Encontrá gente para compartir un mate, preparar un final y hacer tuyo el barrio.</p>
      <ul className="mt-8 flex flex-wrap gap-3">{FEATURES.map((f, i) => { const Icon = ICONS[i]; return <li key={f.slug}><Link href={"/comunidad/" + f.slug} className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur transition hover:-translate-y-0.5 hover:bg-sol hover:text-celeste-950"><Icon aria-hidden="true" />{f.title}</Link></li>; })}</ul>
      <Link href="/comunidad" className="mt-10 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-sol px-8 py-4 text-lg font-bold text-celeste-950 transition hover:-translate-y-0.5 hover:bg-white">Explorar la comunidad <IoArrowForwardOutline aria-hidden="true" /></Link>
    </div>
  </section>;
}
