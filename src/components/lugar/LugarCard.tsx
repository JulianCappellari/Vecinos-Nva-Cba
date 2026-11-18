import { Lugar } from "@/interfaces";
import Link from "next/link";
import { IoArrowForwardOutline, IoLocationOutline } from "react-icons/io5";
import { fontTitulo } from "@/config/fonts";
import { SafeImage } from "../ui/SafeImage";

interface Props {
  lugar: Lugar;
}

/** Tarjeta de lugar: foto a sangre con la información siempre visible (sirve en táctil y en mouse). */
export const LugarCard = ({ lugar }: Props) => {
  const { id, nombre, barrio, direccion, tipo, imagenes } = lugar;
  const foto = (imagenes?.[0]?.url as string | undefined) ?? "";
  const dir = (direccion ?? [])
    .map((d) => (d.altura ? `${d.calle} ${d.altura}` : d.calle))
    .join(", ");

  return (
    <Link
      href={`/lugar/${id}`}
      aria-label={`Ver ${nombre}`}
      className="group relative block aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl bg-celeste-950 shadow-xl ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      <SafeImage
        src={foto}
        alt=""
        fill
        sizes="(max-width: 640px) 90vw, 384px"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-celeste-950 via-celeste-950/40 to-transparent transition-opacity duration-500 group-hover:from-celeste-950/95" />

      {tipo?.length > 0 && (
        <ul className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
          {tipo.slice(0, 3).map((t) => (
            <li
              key={t}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-celeste-950 shadow backdrop-blur"
            >
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-sm text-sky-200">
            <IoLocationOutline aria-hidden="true" /> {barrio}
          </p>
          <h3
            className={`${fontTitulo.className} mt-1 text-[clamp(1.75rem,2.4vw,2.25rem)] uppercase leading-none`}
          >
            {nombre}
          </h3>
          {dir && <p className="mt-2 truncate text-sm text-sky-100">{dir}</p>}
        </div>
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sol text-2xl text-celeste-950 transition-transform duration-500 group-hover:-rotate-45 group-hover:scale-110"
        >
          <IoArrowForwardOutline />
        </span>
      </div>
    </Link>
  );
};
