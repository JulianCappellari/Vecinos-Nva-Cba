import Image from "next/image";
import Link from "next/link";
import {
  IoArrowForwardOutline,
  IoBookOutline,
  IoCheckmarkCircle,
  IoHeartOutline,
  IoPeopleOutline,
  IoPricetagOutline,
  IoSwapHorizontalOutline,
} from "react-icons/io5";
import { fontTitulo } from "@/config/fonts";
import { FEATURES } from "@/lib/community/schema";
import { Reveal, SplitHeading } from "../ui/motion";
import { TiltCard } from "../ui/TiltCard";

const ICONOS: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>> = {
  planes: IoPeopleOutline,
  estudio: IoBookOutline,
  presupuesto: IoPricetagOutline,
  origenes: IoHeartOutline,
  intercambio: IoSwapHorizontalOutline,
};

const PASOS = [
  "Elegí un plan al que puedas ir solo.",
  "Buscá un grupo por tu provincia o tus intereses.",
  "Armá tu lista de lo esencial antes de comprar.",
];

const TILES = FEATURES.filter((f) => f.slug !== "bienvenida");

/** Novedad: la comunidad estudiantil, con una guía para recién llegados y sus cinco áreas. */
export const ComunidadShowcase = () => (
  <section className="px-5 py-20 sm:px-8 md:py-28">
    <div className="mx-auto max-w-6xl">
      <SplitHeading
        text="Venís a estudiar. Hacé barrio."
        className={`${fontTitulo.className} max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] uppercase leading-none text-celeste-950`}
      />
      <Reveal className="mt-4 max-w-xl text-lg text-celeste-900">
        <p>
          Planes para conocer gente, compañeros de estudio y avisos entre estudiantes. Lo nuevo de
          la comunidad, en un solo lugar.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-5">
        <Reveal variant="left" className="lg:col-span-2">
          <TiltCard className="h-full" max={4}>
            <div className="relative flex h-full min-h-[460px] flex-col justify-end overflow-hidden rounded-3xl p-7 text-white shadow-xl">
              <Image
                src="/hero-avenida.jpg"
                alt=""
                fill
                sizes="(min-width:1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-celeste-950 via-celeste-950/80 to-celeste-950/30" />
              <div className="relative">
                <h3 className={`${fontTitulo.className} text-4xl uppercase leading-none text-sol`}>
                  Acabo de llegar
                </h3>
                <p className="mt-2 text-sky-100">Tu primera lista para hacerte un lugar en el barrio.</p>
                <ul className="mt-5 space-y-3">
                  {PASOS.map((p) => (
                    <li key={p} className="flex items-start gap-3">
                      <IoCheckmarkCircle aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-sol" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/comunidad/bienvenida"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-sol px-6 py-3 font-bold text-celeste-950 transition hover:gap-3 hover:bg-white"
                >
                  Armar mi guía <IoArrowForwardOutline aria-hidden="true" />
                </Link>
              </div>
            </div>
          </TiltCard>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
          {TILES.map((f, i) => {
            const Icon = ICONOS[f.slug];
            const ancho = i === TILES.length - 1 ? "sm:col-span-2" : "";
            return (
              <Reveal key={f.slug} variant="pop" delay={(i % 2) * 0.12} className={ancho}>
              <Link
                href={"/comunidad/" + f.slug}
                className="group flex h-full items-start gap-4 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-1.5 hover:bg-celeste-950 hover:shadow-2xl"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-3xl text-white transition-colors duration-300 group-hover:bg-sol group-hover:text-celeste-950">
                  <Icon aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xl font-bold text-celeste-950 transition-colors group-hover:text-white">
                    {f.title}
                  </span>
                  <span className="mt-1 block text-gray-600 transition-colors group-hover:text-sky-100">
                    {f.subtitle}
                  </span>
                </span>
                <IoArrowForwardOutline
                  aria-hidden="true"
                  className="mt-1 h-6 w-6 shrink-0 text-celeste-950 transition-all duration-300 group-hover:translate-x-1 group-hover:text-sol"
                />
              </Link>
              </Reveal>
            );
          })}
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/comunidad"
          className="inline-flex items-center gap-2 rounded-full bg-celeste-950 px-8 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-500"
        >
          Explorar la comunidad <IoArrowForwardOutline aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
);
