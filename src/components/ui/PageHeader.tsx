import Image from "next/image";
import { fontTitulo } from "@/config/fonts";
import { Parallax, SplitHeading } from "./motion";

interface Props {
  titulo: string;
  subtitulo?: string;
  img?: string;
}

/** Cabecera de sección: foto con parallax, titular grande y bajada. */
export const PageHeader = ({ titulo, subtitulo, img = "/hero-avenida.jpg" }: Props) => (
  <header className="aurora relative isolate overflow-hidden bg-celeste-950 text-white">
    <Parallax className="absolute inset-0 -z-10 opacity-30" amount={14}>
      <Image src={img} alt="" fill priority sizes="100vw" className="object-cover" />
    </Parallax>
    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-celeste-950 via-celeste-950/50 to-transparent" />
    <div className="mx-auto max-w-6xl px-5 pb-12 pt-20 sm:px-8 md:pb-16 md:pt-28">
      <SplitHeading
        as="h1"
        onLoad
        text={titulo}
        className={`${fontTitulo.className} text-[clamp(2.75rem,9vw,6.5rem)] uppercase leading-none`}
      />
      {subtitulo && (
        <p className="mt-4 max-w-xl text-base text-sky-100 md:text-xl">{subtitulo}</p>
      )}
    </div>
    <div className="h-1.5 w-full bg-sol" />
  </header>
);
