import Link from "next/link";
import Image from "next/image";
import {
  IoArrowForwardOutline,
  IoBookOutline,
  IoCompassOutline,
  IoHeartOutline,
  IoPeopleOutline,
  IoPricetagOutline,
  IoSwapHorizontalOutline,
} from "react-icons/io5";
import { FEATURES } from "@/lib/community/schema";
import { fontTitulo } from "@/config/fonts";
import { Magnetic } from "@/components/ui/Magnetic";
import { Parallax, Reveal, SplitHeading } from "@/components/ui/motion";
import { TiltCard } from "@/components/ui/TiltCard";

const ICONS = [IoPeopleOutline, IoBookOutline, IoCompassOutline, IoPricetagOutline, IoHeartOutline, IoSwapHorizontalOutline];
// Filas de 3 columnas: 2+1, 1+2, 1+2
const SPANS = ["lg:col-span-2", "", "", "lg:col-span-2", "", "lg:col-span-2"];

export default function CommunityPage() {
  return (
    <div className="overflow-x-clip">
      <section className="aurora bg-celeste-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            <SplitHeading
              as="h1"
              onLoad
              text="Venís a estudiar."
              className={`${fontTitulo.className} text-[clamp(2.5rem,6.2vw,4.75rem)] uppercase leading-[0.98]`}
            />
            <SplitHeading
              as="h2"
              onLoad
              delay={0.35}
              text="Quedate a compartir."
              className={`${fontTitulo.className} text-[clamp(2.5rem,6.2vw,4.75rem)] uppercase leading-[0.98] text-sol`}
            />
            <Reveal className="mt-6 max-w-lg text-lg text-sky-100">
              <p>
                Un mate, una materia, una ciudad nueva. Encontrá con quién compartir lo que viene y
                empezá a hacer tuyo el barrio.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Magnetic>
                  <Link
                    href="/comunidad/planes"
                    className="inline-flex items-center gap-2 rounded-full bg-sol px-7 py-3.5 font-bold text-celeste-950 transition hover:bg-white"
                  >
                    Encontrar mi próximo plan <IoArrowForwardOutline aria-hidden="true" />
                  </Link>
                </Magnetic>
                <Link
                  href="/comunidad/bienvenida"
                  className="font-bold underline underline-offset-4 transition hover:text-sol"
                >
                  Recién llegué
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal variant="right">
            <TiltCard max={4}>
              <Parallax className="relative aspect-[4/5] rounded-3xl shadow-2xl sm:aspect-[5/4] lg:aspect-[4/5]" amount={8}>
                <Image
                  src="/esquina-atardecer.jpg"
                  alt="Un rincón de Nueva Córdoba para descubrir"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </Parallax>
              <div className="absolute inset-x-0 bottom-0 rounded-b-3xl bg-gradient-to-t from-celeste-950 to-transparent p-6 pt-24">
                <p className="text-lg">Siempre hay una primera vez.</p>
                <p className={`${fontTitulo.className} text-3xl uppercase text-sol`}>Que sea en compañía.</p>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <SplitHeading
          text="¿Qué necesitás hoy?"
          className={`${fontTitulo.className} text-[clamp(2.25rem,6vw,4rem)] uppercase leading-none text-celeste-950`}
        />
        <Reveal className="mt-3 max-w-md text-lg text-celeste-900">
          <p>Elegí por dónde empezar. El resto se va armando.</p>
        </Reveal>

        <Reveal stagger className="mt-12 grid gap-5 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = ICONS[i];
            return (
              <TiltCard key={f.slug} className={`h-full ${SPANS[i]}`} max={4}>
                <Link
                  href={"/comunidad/" + f.slug}
                  className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-xl"
                >
                  <Image
                    src={f.image}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 40vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-celeste-950 via-celeste-950/65 to-celeste-950/25" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-sol text-3xl text-celeste-950 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <Icon aria-hidden="true" />
                  </span>
                  <div className="relative">
                    <h3 className={`${fontTitulo.className} text-[clamp(1.75rem,3vw,2.5rem)] uppercase leading-none`}>
                      {f.title}
                    </h3>
                    <p className="mt-2 font-bold text-sol">{f.subtitle}</p>
                    <p className="mt-1 max-w-md text-sky-100">{f.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-bold backdrop-blur transition-all duration-300 group-hover:gap-4 group-hover:bg-sol group-hover:text-celeste-950">
                      Entrar <IoArrowForwardOutline aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </TiltCard>
            );
          })}
        </Reveal>
      </section>

      <section className="aurora bg-sky-500 px-5 py-16 text-center text-white sm:px-8 md:py-24">
        <SplitHeading
          text="¿Tenés una idea para compartir?"
          className={`${fontTitulo.className} mx-auto max-w-3xl text-[clamp(2.25rem,6vw,4rem)] uppercase leading-none`}
        />
        <Reveal className="mx-auto mt-5 max-w-xl text-lg">
          <p>
            Proponé un encuentro, armá una mesa de estudio o dale una segunda vida a eso que ya no
            usás.
          </p>
          <div className="mt-8">
            <Magnetic>
              <Link
                href="/comunidad/publicar"
                className="inline-block rounded-full bg-celeste-950 px-8 py-4 text-lg font-bold text-white transition hover:bg-sol hover:text-celeste-950"
              >
                Sumar mi propuesta
              </Link>
            </Magnetic>
          </div>
          <p className="mt-5 text-sm text-sky-50">
            Las publicaciones pasan por revisión. Entre todos cuidamos este espacio.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
