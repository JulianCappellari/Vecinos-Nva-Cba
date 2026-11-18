"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fontTitulo } from "@/config/fonts";
import { Magnetic } from "../ui/Magnetic";
import { prefersReducedMotion, SplitHeading } from "../ui/motion";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export const HomeHero = () => {
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const ctx = gsap.context(() => {
      // Al cargar: la bajada y los botones entran después del titular
      gsap.from("[data-hero-in]", {
        y: 30,
        opacity: 0,
        duration: 0.9,
        delay: 0.9,
        stagger: 0.15,
        ease: "power3.out",
      });
      // Al hacer scroll: la foto se acerca y el texto se desvanece hacia arriba
      gsap.to(img.current, {
        scale: 1.25,
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(copy.current, {
        yPercent: -25,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "70% top", scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative h-[calc(100svh-4rem)] min-h-[560px] w-full overflow-hidden bg-celeste-950"
    >
      <div ref={img} className="absolute inset-0 will-change-transform">
        <Image
          src="/hero-avenida.jpg"
          alt="Vista aérea de Nueva Córdoba al atardecer"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-celeste-950 via-celeste-950/60 to-celeste-950/20" />

      <div
        ref={copy}
        className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-16 sm:px-8 md:pb-24"
      >
        <SplitHeading
          as="h1"
          onLoad
          delay={0.2}
          text="Por una vecindad conectada"
          className={`${fontTitulo.className} max-w-4xl text-[clamp(2.75rem,10vw,7.5rem)] uppercase leading-[0.95] text-white`}
        />
        <p
          data-hero-in
          className="mt-6 max-w-xl text-base text-sky-100 sm:text-lg md:text-xl"
        >
          Grupos, profesionales y lugares para que los vecinos de Nueva Córdoba se
          encuentren y se den una mano.
        </p>
        <div data-hero-in className="mt-8 flex flex-wrap gap-3">
          <Magnetic>
<Link
            href="/grupos"
            className="rounded-full bg-sol px-7 py-3 font-bold text-celeste-950 transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Buscar mi grupo
          </Link>
          </Magnetic>
          <Magnetic>
<Link
            href="/nuevo"
            className="rounded-full border border-white/70 px-7 py-3 font-bold text-white transition hover:bg-white hover:text-celeste-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Sumar el mío
          </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
};
