import Image from "next/image";
import Link from "next/link";
import {
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoConstructOutline,
  IoLocationOutline,
  IoLogoWhatsapp,
  IoMailOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { PageHeader } from "@/components/ui/PageHeader";
import { RedesSociales } from "@/components/nosotros/RedesSociales";
import { Reveal, SplitHeading } from "@/components/ui/motion";
import { TiltCard } from "@/components/ui/TiltCard";
import { fontTitulo } from "@/config/fonts";

export const metadata = {
  title: "Sobre nosotros",
  description:
    "Somos vecinos de Nueva Córdoba. Reunimos grupos, profesionales y lugares del barrio, y una comunidad para quienes llegan a estudiar.",
};

const SECCIONES = [
  {
    icon: <IoPeopleOutline />,
    titulo: "Grupos",
    texto: "Grupos de WhatsApp por interés, para conocer gente y armar planes.",
    href: "/grupos",
    cta: "Ver grupos",
    img: "/esquina-atardecer.jpg",
  },
  {
    icon: <IoConstructOutline />,
    titulo: "Profesionales",
    texto: "Oficios y profesiones con teléfono y redes, para escribirles directo.",
    href: "/profesionales",
    cta: "Ver profesionales",
    img: "/panoramica-dorada.jpg",
  },
  {
    icon: <IoBusinessOutline />,
    titulo: "Lugares",
    texto: "Bares, plazas y rincones de Nueva Córdoba, con su dirección y su tipo de lugar.",
    href: "/lugares",
    cta: "Ver lugares",
    img: "/capuchinos.jpg",
  },
];

const CUIDADOS = [
  {
    icon: <IoShieldCheckmarkOutline />,
    titulo: "Se revisa antes de publicar",
    texto: "Las publicaciones nuevas y las ediciones quedan pendientes hasta que alguien las revisa.",
  },
  {
    icon: <IoMailOutline />,
    titulo: "Tu correo es privado",
    texto: "En las publicaciones se ve el nombre que elegís, nunca tu correo.",
  },
  {
    icon: <IoLogoWhatsapp />,
    titulo: "Tu WhatsApp, si querés",
    texto: "Se muestra solo cuando lo autorizás al crear la propuesta.",
  },
  {
    icon: <IoLocationOutline />,
    titulo: "Mejor en lugares públicos",
    texto:
      "No comprobamos quién es cada persona ni qué estudia, así que conviene encontrarse en un lugar público.",
  },
];

export default function NosotrosPage() {
  return (
    <div className="overflow-x-clip">
      <PageHeader
        titulo="Sobre nosotros"
        subtitulo="Somos vecinos de Nueva Córdoba. Armamos este sitio para encontrarnos y darnos una mano."
        img="/hero-avenida.jpg"
      />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-[auto_1fr] md:gap-16 md:py-24">
        <Reveal variant="left" className="flex justify-center">
          <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-black/5 md:p-12">
            <Image
              src="/brand/la-esquina/svg/logo-apilado-color.svg"
              alt="Logo de Vecinos de Nueva Córdoba"
              width={360}
              height={300}
              className="h-auto w-full max-w-[260px] md:max-w-[320px]"
            />
          </div>
        </Reveal>
        <div>
          <SplitHeading
            text="De qué se trata"
            className={`${fontTitulo.className} text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-celeste-950`}
          />
          <Reveal className="mt-6 max-w-2xl space-y-4 text-lg text-celeste-900">
            <p>
              Vecinos de Nueva Córdoba es un directorio hecho por vecinos. Junta en un solo sitio los
              grupos de WhatsApp, los profesionales y los lugares del barrio, para que no tengas que
              preguntar en cada chat.
            </p>
            <p>
              Mucha gente llega a Nueva Córdoba a estudiar desde otras provincias y no conoce a nadie.
              Para eso armamos la Comunidad: planes a los que se puede ir solo, mesas de estudio y
              avisos entre estudiantes.
            </p>
            <p>Todo lo carga gente del barrio. Si te falta algo, podés sumarlo vos.</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-celeste-100 px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SplitHeading
            text="Qué vas a encontrar"
            className={`${fontTitulo.className} mb-12 text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-celeste-950`}
          />
          <Reveal stagger className="grid gap-6 md:grid-cols-3">
            {SECCIONES.map((c) => (
              <TiltCard key={c.titulo} className="h-full" max={5}>
                <Link
                  href={c.href}
                  className="group relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-2xl p-6 text-white shadow-xl"
                >
                  <Image
                    src={c.img}
                    alt=""
                    fill
                    sizes="(min-width:768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-celeste-950 via-celeste-950/60 to-celeste-950/20 transition-colors duration-500 group-hover:from-celeste-950/95" />
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-sol text-3xl text-celeste-950 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    {c.icon}
                  </span>
                  <div className="relative">
                    <h3
                      className={`${fontTitulo.className} text-[clamp(2.5rem,3.8vw,3.25rem)] uppercase leading-none`}
                    >
                      {c.titulo}
                    </h3>
                    <p className="mt-3 text-sky-100">{c.texto}</p>
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-bold backdrop-blur transition-all duration-300 group-hover:gap-4 group-hover:bg-sol group-hover:text-celeste-950">
                      {c.cta} <IoArrowForwardOutline aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </TiltCard>
            ))}

            <TiltCard className="md:col-span-3" max={2}>
              <Link
                href="/comunidad"
                className="group relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-2xl p-6 text-white shadow-xl md:p-10"
              >
                <Image
                  src="/hero-avenida.jpg"
                  alt=""
                  fill
                  sizes="(min-width:1152px) 1152px, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-celeste-950 via-celeste-950/80 to-celeste-950/20" />
                <div className="relative max-w-xl">
                  <h3 className={`${fontTitulo.className} text-[clamp(2.5rem,4vw,3.5rem)] uppercase leading-none text-sol`}>
                    Comunidad
                  </h3>
                  <p className="mt-3 text-lg text-sky-100">
                    Planes para ir sin conocer a nadie, mesas de estudio, una guía para recién llegados y
                    avisos entre estudiantes.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-sol px-6 py-3 font-bold text-celeste-950 transition-all duration-300 group-hover:gap-4 group-hover:bg-white">
                    Entrar a la comunidad <IoArrowForwardOutline aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      <section className="aurora bg-celeste-950 px-5 py-16 text-white sm:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SplitHeading
            text="Cómo cuidamos la comunidad"
            className={`${fontTitulo.className} max-w-3xl text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-sol`}
          />
          <Reveal stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CUIDADOS.map((c) => (
              <div key={c.titulo} className="rounded-2xl bg-white/10 p-6 backdrop-blur">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sol text-2xl text-celeste-950">
                  {c.icon}
                </span>
                <h3 className="mt-4 text-lg font-bold">{c.titulo}</h3>
                <p className="mt-2 text-sky-100">{c.texto}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 md:py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 text-center">
          <div>
            <SplitHeading
              text="¿Tenés un local o das un servicio?"
              className={`${fontTitulo.className} mx-auto max-w-3xl text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-celeste-950`}
            />
            <Reveal className="mt-4 text-lg text-celeste-900">
              <p>Cargalo y aparecés en Lugares o Profesionales.</p>
              <Link
                href="/nuevo"
                className="mt-6 inline-block rounded-full bg-celeste-950 px-8 py-4 font-bold text-white transition hover:-translate-y-0.5 hover:bg-sky-500"
              >
                Registrar
              </Link>
            </Reveal>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="mb-5 text-xl font-bold text-celeste-950">Seguinos en Instagram y X</h2>
            <RedesSociales />
          </div>
        </div>
      </section>
    </div>
  );
}
