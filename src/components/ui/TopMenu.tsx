"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoArrowForwardOutline,
  IoBusinessOutline,
  IoCloseOutline,
  IoConstructOutline,
  IoHeartOutline,
  IoHomeOutline,
  IoInformationCircleOutline,
  IoMenuOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import { Magnetic } from "./Magnetic";

const LINKS = [
  { href: "/comunidad", label: "Comunidad", icon: IoHeartOutline, destacado: true },
  { href: "/grupos", label: "Grupos", icon: IoPeopleOutline },
  { href: "/profesionales", label: "Profesionales", icon: IoConstructOutline },
  { href: "/lugares", label: "Lugares", icon: IoBusinessOutline },
  { href: "/nosotros", label: "Nosotros", icon: IoInformationCircleOutline },
];

export const TopMenu = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Se oculta al bajar, reaparece al subir y toma sombra al despegarse del borde
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 120);
      setScrolled(y > 8);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setShowMenu(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = showMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMenu]);

  const activo = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-transform duration-300 ${
        hidden && !showMenu ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav
        aria-label="Principal"
        className={`bg-celeste-950/95 backdrop-blur-md transition-shadow duration-300 ${
          scrolled || showMenu ? "shadow-[0_8px_30px_-10px_rgb(0_0_0/0.5)]" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/" aria-label="Vecinos de Nueva Córdoba, inicio" className="shrink-0">
            <Image src="/brand/la-esquina/svg/logo-horizontal-inverso.svg" alt="" width={156} height={40} priority className="h-10 w-auto md:h-11" />
          </Link>

          {/* Escritorio */}
          <ul className="hidden items-center gap-1 rounded-full bg-white/10 p-1 lg:flex">
            {LINKS.map((l) => {
              const on = activo(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={on ? "page" : undefined}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-bold transition-all duration-300 xl:px-4 ${
                      on
                        ? "bg-sol text-celeste-950 shadow"
                        : "text-sky-100 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <l.icon aria-hidden="true" className="hidden h-4 w-4 xl:block" />
                    {l.label}
                    {l.destacado && !on && (
                      <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-sol" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden lg:block">
            <Magnetic strength={0.25}>
              <Link
                href="/nuevo"
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-300 ${
                  activo("/nuevo")
                    ? "bg-white text-celeste-950"
                    : "bg-sky-500 text-white hover:bg-white hover:text-celeste-950"
                }`}
              >
                Registrar nuevo <IoArrowForwardOutline aria-hidden="true" />
              </Link>
            </Magnetic>
          </div>

          {/* Móvil */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
            onClick={() => setShowMenu((v) => !v)}
            aria-expanded={showMenu}
            aria-controls="menu-movil"
            aria-label={showMenu ? "Cerrar menú" : "Abrir menú"}
          >
            {showMenu ? <IoCloseOutline className="h-7 w-7" /> : <IoMenuOutline className="h-7 w-7" />}
          </button>
        </div>
      </nav>

      <div
        id="menu-movil"
        className={`fixed inset-x-0 top-16 h-[calc(100svh-4rem)] overflow-y-auto bg-celeste-950 transition-all duration-300 lg:hidden ${
          showMenu ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* El fondo animado va en un contenedor interno: .aurora fija position: relative y rompería el "fixed" del panel. */}
        <div className="aurora min-h-full">
        <ul className="mx-auto flex max-w-md flex-col gap-3 p-5 pb-10">
          {[{ href: "/", label: "Inicio", icon: IoHomeOutline }, ...LINKS].map((l, i) => {
            const on = l.href === "/" ? pathname === "/" : activo(l.href);
            return (
              <li
                key={l.href}
                style={{ transitionDelay: showMenu ? `${i * 55}ms` : "0ms" }}
                className={`transition-all duration-500 ${
                  showMenu ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <Link
                  href={l.href}
                  aria-current={on ? "page" : undefined}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-xl font-bold transition ${
                    on ? "bg-sol text-celeste-950" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <l.icon aria-hidden="true" className="h-6 w-6" />
                  {l.label}
                </Link>
              </li>
            );
          })}
          <li
            style={{ transitionDelay: showMenu ? "400ms" : "0ms" }}
            className={`pt-2 transition-all duration-500 ${
              showMenu ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <Link
              href="/nuevo"
              className="flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-celeste-950"
            >
              Registrar nuevo <IoArrowForwardOutline aria-hidden="true" />
            </Link>
          </li>
        </ul>
        </div>
      </div>
    </header>
  );
};
