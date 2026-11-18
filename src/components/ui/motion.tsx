"use client";
import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Variant = "up" | "left" | "right" | "pop";

const fromVars = (variant: Variant): gsap.TweenVars => {
  switch (variant) {
    case "left":
      return { x: -70, opacity: 0 };
    case "right":
      return { x: 70, opacity: 0 };
    case "pop":
      return { y: 70, scale: 0.9, rotate: 2, opacity: 0, transformOrigin: "50% 100%" };
    default:
      return { y: 48, opacity: 0 };
  }
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  delay?: number;
  /** Anima cada hijo directo con un retraso escalonado */
  stagger?: boolean;
}

/** Aparece al hacer scroll (ScrollTrigger). Se desactiva con prefers-reduced-motion. */
export const Reveal = ({
  children,
  className = "",
  variant = "up",
  delay = 0,
  stagger = false,
}: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(stagger ? Array.from(el.children) : el, {
        ...fromVars(variant),
        duration: 0.9,
        delay,
        ease: "power3.out",
        stagger: stagger ? 0.14 : 0,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [variant, delay, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

interface SplitHeadingProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** true = anima al cargar la página, false = al llegar con el scroll */
  onLoad?: boolean;
  delay?: number;
}

/** Titular que sube palabra por palabra desde una máscara. */
export const SplitHeading = ({
  text,
  as: Tag = "h2",
  className = "",
  onLoad = false,
  delay = 0,
}: SplitHeadingProps) => {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll("[data-w]"), {
        yPercent: 115,
        rotate: 4,
        duration: 1,
        delay,
        ease: "power4.out",
        stagger: 0.09,
        scrollTrigger: onLoad
          ? undefined
          : { trigger: el, start: "top 88%", once: true },
      });
    }, el);
    return () => ctx.revert();
  }, [onLoad, delay]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split(" ").map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden align-top pb-[0.12em] -mb-[0.12em]"
        >
          <span data-w className="inline-block origin-bottom-left">
            {w}
            {" "}
          </span>
        </span>
      ))}
    </Tag>
  );
};

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** porcentaje de desplazamiento vertical del contenido */
  amount?: number;
}

/** Contenedor con overflow oculto cuyo contenido se desplaza más lento que el scroll. */
export const Parallax = ({ children, className = "", amount = 15 }: ParallaxProps) => {
  const wrap = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    const i = inner.current;
    if (!w || !i || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        i,
        { yPercent: -amount },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true },
        }
      );
    }, w);
    return () => ctx.revert();
  }, [amount]);

  return (
    <div ref={wrap} className={`overflow-hidden ${className}`}>
      <div ref={inner} className="h-[130%] w-full -mt-[15%]">
        {children}
      </div>
    </div>
  );
};

export const Marquee = ({ items }: { items: string[] }) => {
  const row = (hidden: boolean) => (
    <ul className="marquee-row" aria-hidden={hidden}>
      {items.map((t) => (
        <li key={t} className="flex items-center gap-8 pr-8">
          <span>{t}</span>
          <span className="text-sol">✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden" role="presentation">
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
};
