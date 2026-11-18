import Link from "next/link";
import { notFound } from "next/navigation";
import { IoBriefcaseOutline, IoCallOutline, IoLogoWhatsapp } from "react-icons/io5";
import { getProfesionalConNombre } from "@/actions/profesional/get-profesional-con-nombre";
import { Galeria } from "@/components/lugar/Galeria";
import { Reveal, SplitHeading } from "@/components/ui/motion";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { fontTitulo } from "@/config/fonts";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { abs, breadcrumbs, clip, pageMeta } from "@/lib/seo";

interface Props {
  params: { nombreApellido: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProfesionalConNombre(decodeURIComponent(params.nombreApellido));
  if (!p) return { title: "Profesional no encontrado", robots: { index: false, follow: true } };
  const oficio = p.trabajo.join(", ");
  return pageMeta({
    title: `${p.nombre} ${p.apellido}${oficio ? `, ${oficio}` : ""} en Nueva Córdoba`,
    description: clip(
      `${p.nombre} ${p.apellido}${oficio ? `, ${oficio}` : ""} en Nueva Córdoba. Contactalo por WhatsApp o por sus redes desde el directorio de vecinos.`
    ),
    path: `/profesional/${encodeURIComponent(`${p.nombre}-${p.apellido}`)}`,
    image: (p.imagen[0]?.url as string | undefined) || undefined,
  });
}

export default async function ProfesionalPage({ params }: Props) {
  const profesional = await getProfesionalConNombre(decodeURIComponent(params.nombreApellido));
  if (!profesional) notFound();

  const soloDigitos = profesional.numero.replace(/\D/g, "");
  const nombreCompleto = `${profesional.nombre} ${profesional.apellido}`;

  const ruta = `/profesional/${encodeURIComponent(`${profesional.nombre}-${profesional.apellido}`)}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": abs(ruta),
      name: nombreCompleto,
      url: abs(ruta),
      jobTitle: profesional.trabajo.join(", "),
      image: profesional.imagen.map((i: { url: string }) => abs(i.url)),
      workLocation: { "@type": "Place", name: "Nueva Córdoba, Córdoba, Argentina" },
      ...(profesional.redesSociales.length ? { sameAs: profesional.redesSociales.map((r: { url: string }) => r.url) } : {}),
    },
    breadcrumbs([
      { name: "Inicio", path: "/" },
      { name: "Profesionales", path: "/profesionales" },
      { name: nombreCompleto, path: ruta },
    ]),
  ];

  return (
    <div className="overflow-x-clip">
      <JsonLd data={jsonLd} />
      <section className="bg-celeste-950 px-5 pb-10 pt-12 text-white sm:px-8 md:pb-14 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <ul className="mb-3 flex flex-wrap gap-2">
            {profesional.trabajo.map((t) => (
              <li key={t} className="rounded-full bg-sol px-3 py-1 text-sm font-bold text-celeste-950">
                {t}
              </li>
            ))}
          </ul>
          <SplitHeading
            as="h1"
            onLoad
            text={nombreCompleto}
            className={`${fontTitulo.className} text-[clamp(2.5rem,8vw,6rem)] uppercase leading-none`}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.3fr_1fr] lg:py-16">
        <Reveal variant="left" className="min-w-0 lg:-mt-24">
          <Galeria imagenes={profesional.imagen.map((i: { url: string }) => i.url)} titulo={nombreCompleto} />
        </Reveal>

        <Reveal variant="right" className="min-w-0">
          <div className="space-y-6 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <div className="flex gap-4">
              <IoBriefcaseOutline className="mt-1 h-6 w-6 shrink-0 text-sky-500" />
              <div>
                <h2 className="font-bold text-celeste-950">Trabajo</h2>
                <p className="text-gray-700">{profesional.trabajo.join(", ")}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <IoCallOutline className="mt-1 h-6 w-6 shrink-0 text-sky-500" />
              <div>
                <h2 className="font-bold text-celeste-950">Teléfono</h2>
                <p className="text-gray-700">{profesional.numero}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`https://wa.me/${soloDigitos}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-green-600"
              >
                <IoLogoWhatsapp className="h-5 w-5" /> WhatsApp
              </Link>
              <Link
                href={`tel:${profesional.numero}`}
                className="flex items-center justify-center gap-2 rounded-full bg-celeste-950 px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-celeste-700"
              >
                <IoCallOutline className="h-5 w-5" /> Llamar
              </Link>
            </div>
            {profesional.redesSociales.length > 0 && (
              <div>
                <h2 className="mb-3 font-bold text-celeste-950">Redes</h2>
                <SocialLinks redes={profesional.redesSociales} />
              </div>
            )}
          </div>
        </Reveal>
      </section>

      <div className="pb-16 text-center">
        <Link href="/profesionales" className="font-bold text-celeste-700 underline underline-offset-4 hover:text-celeste-950">
          Volver a profesionales
        </Link>
      </div>
    </div>
  );
}
