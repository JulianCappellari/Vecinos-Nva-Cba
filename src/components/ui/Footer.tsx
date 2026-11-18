import Link from "next/link";
import Image from "next/image";
import { IoLogoInstagram, IoLogoTwitter } from "react-icons/io5";
import { fontTitulo } from "@/config/fonts";

const LINKS = [
  { href: "/comunidad", label: "Vida estudiantil" },
  { href: "/nosotros", label: "Sobre nosotros" },
  { href: "/grupos", label: "Grupos" },
  { href: "/profesionales", label: "Profesionales" },
  { href: "/lugares", label: "Lugares" },
  { href: "/nuevo", label: "Registrar nuevo" },
];

export const Footer = () => (
  <footer className="overflow-hidden bg-celeste-950 text-white">
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-16 sm:px-8">
      <p
        className={`${fontTitulo.className} text-[clamp(2.5rem,9vw,7rem)] uppercase leading-none text-sky-500`}
      >
        Vecinos de
        <br />
        Nueva Córdoba
      </p>

      <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <nav aria-label="Pie de página">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-3 md:flex md:gap-8">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sky-100 transition hover:text-sol">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="https://www.instagram.com/vecinosdenuevacordoba/"
            aria-label="Instagram"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl transition hover:-translate-y-1 hover:bg-sol hover:text-celeste-950"
          >
            <IoLogoInstagram />
          </Link>
          <Link
            href="https://x.com/vecinosdenvacba"
            aria-label="X / Twitter"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl transition hover:-translate-y-1 hover:bg-sol hover:text-celeste-950"
          >
            <IoLogoTwitter />
          </Link>
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between border-t border-white/15 pt-6 text-sm text-sky-200">
        <Image src="/brand/la-esquina/svg/logo-horizontal-inverso.svg" alt="Vecinos de Nueva Córdoba" width={164} height={42} className="h-10 w-auto" />
        <p>Vecinos Nueva Córdoba ®</p>
      </div>
    </div>
  </footer>
);
