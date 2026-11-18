import { Profesional } from "@/interfaces";
import Link from "next/link";
import { IoArrowForwardOutline, IoLogoWhatsapp } from "react-icons/io5";
import { fontTitulo } from "@/config/fonts";
import { SafeImage } from "../ui/SafeImage";

interface Props {
  profesional: Profesional;
}

export const ProfesionalCard = ({ profesional }: Props) => {
  const { nombre, apellido, trabajo, imagen, numero } = profesional;
  const foto = (imagen?.[0]?.url as string | undefined) ?? "";
  const digitos = (numero ?? "").replace(/\D/g, "");

  return (
    <article className="group flex h-full w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-2xl">
      <div className="relative aspect-[4/5] overflow-hidden bg-celeste-100">
        <SafeImage
          src={foto}
          fallback="/brand/la-esquina/redes/avatar-azul.svg"
          alt={`${nombre} ${apellido}`}
          fill
          sizes="(max-width: 640px) 90vw, 384px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-celeste-950 via-celeste-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3
            className={`${fontTitulo.className} text-[clamp(1.75rem,2.4vw,2.25rem)] uppercase leading-none text-white`}
          >
            {nombre} {apellido}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {trabajo?.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {trabajo.map((t, i) => (
              <li
                key={i}
                className="rounded-full bg-celeste-100 px-3 py-1 text-sm font-bold text-celeste-800"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex items-center gap-3 pt-5">
          <Link
            href={`/profesional/${nombre}-${apellido}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-celeste-950 px-5 py-3 font-bold text-white transition-all duration-300 hover:gap-3 hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            Ver perfil <IoArrowForwardOutline aria-hidden="true" />
          </Link>
          {digitos && (
            <Link
              href={`https://wa.me/${digitos}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Escribir por WhatsApp a ${nombre} ${apellido}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-2xl text-white transition hover:-translate-y-0.5 hover:bg-green-600"
            >
              <IoLogoWhatsapp />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
