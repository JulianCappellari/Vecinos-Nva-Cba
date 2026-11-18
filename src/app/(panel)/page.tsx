import Link from "next/link";

import { fontTitulo } from "@/config/fonts";
import { LugarCard } from "@/components";
import { getGrupoById } from "@/actions/grupo/get-grupo-by-id";
import { getLugarById } from "@/actions/lugar/get-lugar-by-id";
import { GrupoCard2 } from "@/components/grupo/GrupoCard2";
import { ProfesionalCard } from "@/components/profesional/ProfesionalCard";
import { getProfesionalPaginacion } from "@/actions/profesional/get-profecional-paginacion";
import { ComunidadShowcase } from "@/components/home/ComunidadShowcase";
import AnimatedSection from "@/components/ui/GSAP";
import { Magnetic } from "@/components/ui/Magnetic";
import { HomeHero } from "@/components/home/HomeHero";
import { Pillars } from "@/components/home/Pillars";
import { Marquee, Parallax, Reveal, SplitHeading } from "@/components/ui/motion";

// La portada lee la base en cada visita: sin esto Next la congela con los datos del momento del build.
export const dynamic = "force-dynamic";

const GRUPO_IDS = [
  "96b33d16-c4ad-49a0-b612-7b6e419ffa88",
  "1bcdb26a-f27d-42a1-a914-b9ec29014ff9",
  "a85d87d7-2045-4f0a-9efd-bb7f52f04dd1",
];

const LUGAR_IDS = [
  "34b71c82-a584-427f-98af-568536e3c3d4",
  "c2bfb6bd-4d45-4985-ad06-a38b88c18294",
  "c80b8630-3a32-423a-b9b7-a2026cb0f929",
];

const tituloSeccion = `${fontTitulo.className} text-[clamp(2.25rem,6vw,4.5rem)] uppercase leading-none`;

export default async function PanelPage() {
  const grupoData = await getGrupoById(GRUPO_IDS);
  const lugaresDb = await Promise.all(LUGAR_IDS.map((id) => getLugarById(id)));
  const lugares = lugaresDb.filter(
    (l): l is NonNullable<typeof l> => !!l && l.imagenes.length > 0
  );

  const { profesionales } = await getProfesionalPaginacion({ pagina: 1, take: 3 }).catch(() => ({ profesionales: [] }));
  const destacados = profesionales.slice(0, 3);

  return (
    <div className="overflow-x-clip">
      <HomeHero />

      <div className="bg-sol py-4 text-celeste-950">
        <Marquee
          items={["Comunidad", "Grupos", "Profesionales", "Lugares", "Vecinos", "Nueva Córdoba"]}
        />
      </div>

      <ComunidadShowcase />

      <Pillars />

      {/* Grupos */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <SplitHeading text="Grupos más destacados" className={`${tituloSeccion} text-celeste-950`} />
        <Reveal className="mt-4 max-w-lg text-lg text-celeste-900">
          <p>Entrá a un grupo de WhatsApp y empezá a conocer a tus vecinos.</p>
        </Reveal>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {grupoData?.grupos.map((grupo, index) => (
            <AnimatedSection key={grupo.url} index={index}>
              <GrupoCard2
                titulo={grupo.nombre}
                descripcion={grupo.descripcion}
                url={grupo.url}
                img={grupo.imagen ?? ""}
              />
            </AnimatedSection>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link
            href="/grupos"
            className="inline-block rounded-full bg-celeste-950 px-7 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-celeste-700"
          >
            Ver todos los grupos
          </Link>
        </div>
      </section>

      {/* Profesionales */}
      <section className="relative isolate overflow-hidden bg-celeste-950 text-white">
        <Parallax className="absolute inset-0 -z-10 opacity-30" amount={12}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/esquina-atardecer.jpg" alt="" className="h-full w-full object-cover" />
        </Parallax>
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
          <SplitHeading text="Profesionales" className={`${tituloSeccion} text-sol`} />
          <Reveal className="mt-6 max-w-2xl text-base text-sky-100 md:text-xl">
            <p>
              Un catálogo de profesionales de distintas especialidades, para que no
              tengas que buscar por todos lados. Elegí la especialidad que necesitás y
              encontrá teléfono y enlaces a sus redes.
            </p>
            <Link
              href="/profesionales"
              className="mt-8 inline-block rounded-full bg-sol px-7 py-3 font-bold text-celeste-950 transition hover:-translate-y-0.5 hover:bg-white"
            >
              Buscar un profesional
            </Link>
          </Reveal>
          {destacados.length > 0 && (
            <div className="mt-14 grid grid-cols-1 justify-items-center gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {destacados.map((p, index) => (
                <AnimatedSection key={p.numero} index={index}>
                  <ProfesionalCard profesional={p} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lugares */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <SplitHeading text="Lugares sorprendentes" className={`${tituloSeccion} text-celeste-950`} />
        <div className="mt-16 grid grid-cols-1 justify-items-center gap-x-8 gap-y-16 lg:grid-cols-3">
          {lugares.map((lugar, index) => (
            <AnimatedSection key={lugar.id} index={index}>
              <LugarCard lugar={lugar} />
            </AnimatedSection>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link
            href="/lugares"
            className="inline-block rounded-full bg-celeste-950 px-7 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-celeste-700"
          >
            Ver todos los lugares
          </Link>
        </div>
      </section>

      {/* Invitación final */}
      <section className="aurora bg-sky-500 px-5 py-20 text-center sm:px-8 md:py-28">
        <SplitHeading
          text="¿Tenés un grupo, un local o un servicio?"
          className={`${tituloSeccion} mx-auto max-w-4xl text-white`}
        />
        <Reveal className="mt-8">
          <Magnetic>
            <Link
              href="/nuevo"
              className="inline-block rounded-full bg-celeste-950 px-8 py-4 text-lg font-bold text-white transition hover:bg-sol hover:text-celeste-950"
            >
              Registrarlo
            </Link>
          </Magnetic>
        </Reveal>
      </section>
    </div>
  );
}
