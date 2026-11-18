"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fontTitulo } from "@/config/fonts";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    titulo: "Grupos",
    texto:
      "Grupos de WhatsApp por interés para conocer gente, armar planes y charlar con los de la zona.",
    href: "/grupos",
    cta: "Ver grupos",
    img: "/esquina-atardecer.jpg",
    alt: "Esquina de Nueva Córdoba con edificios y calle arbolada",
  },
  {
    titulo: "Profesionales",
    texto:
      "Un catálogo de oficios y profesiones con teléfono y redes, para resolver una urgencia sin buscar por todos lados.",
    href: "/profesionales",
    cta: "Buscar profesional",
    img: "/panoramica-dorada.jpg",
    alt: "Avenida de Nueva Córdoba vista desde arriba",
  },
  {
    titulo: "Lugares",
    texto:
      "Bares, cafés y rincones del barrio que vale la pena conocer, con dirección y tipo de lugar.",
    href: "/lugares",
    cta: "Explorar lugares",
    img: "/capuchinos.jpg",
    alt: "Paseo del Buen Pastor iluminado de noche",
  },
];

export const Pillars = () => {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const t = track.current;
    if (!w || !t) return;
    const mm = gsap.matchMedia();

    // Escritorio: scroll horizontal anclado
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const dist = () => Math.max(0, t.scrollWidth - window.innerWidth);
      gsap.to(t, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: w,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: () => "+=" + dist(),
        },
      });
      gsap.to(bar.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: w, start: "top top", end: () => "+=" + dist(), scrub: true },
      });
      // la foto de cada panel se desplaza dentro de su marco
      gsap.utils.toArray<HTMLElement>("[data-pimg]").forEach((el) => {
        gsap.fromTo(
          el,
          { xPercent: -8 },
          {
            xPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: w, start: "top top", end: () => "+=" + dist(), scrub: true },
          }
        );
      });
    });

    // Móvil/tablet: los paneles apilados entran con el scroll
    mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((el) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={wrap} className="relative overflow-hidden bg-celeste-950 text-white">
      <div ref={track} className="flex flex-col lg:h-screen lg:w-max lg:flex-row">
        {PILLARS.map((p, i) => (
          <article
            key={p.titulo}
            data-panel
            className="relative flex min-h-[70svh] w-full flex-col justify-end overflow-hidden lg:h-full lg:w-[70vw] lg:shrink-0"
          >
            <div data-pimg className="absolute -inset-x-[10%] inset-y-0">
              <Image src={p.img} alt={p.alt} fill sizes="(min-width:1024px) 80vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-celeste-950 via-celeste-950/70 to-celeste-950/30" />
            <div className="relative z-10 p-6 pb-14 sm:p-10 lg:p-16 lg:pb-24">
              <h2
                className={`${fontTitulo.className} text-[clamp(3rem,9vw,8rem)] uppercase leading-none`}
              >
                {p.titulo}
              </h2>
              <p className="mt-4 max-w-md text-base text-sky-100 md:text-lg">{p.texto}</p>
              <Link
                href={p.href}
                className="mt-6 inline-block rounded-full bg-sol px-6 py-3 font-bold text-celeste-950 transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {p.cta}
              </Link>
            </div>
            {i < PILLARS.length - 1 && (
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/20 lg:inset-y-0 lg:left-auto lg:h-auto lg:w-px" />
            )}
          </article>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1.5 bg-white/15 lg:block">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-sol" />
      </div>
    </section>
  );
};
