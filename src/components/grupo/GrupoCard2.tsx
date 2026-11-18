import Link from "next/link";
import { IoArrowForwardOutline, IoLogoWhatsapp } from "react-icons/io5";
import { SafeImage } from "../ui/SafeImage";

interface Props {
  titulo: string;
  descripcion: string;
  url: string;
  tipo?: string;
  img: string;
}

export const GrupoCard2 = ({ titulo, descripcion, url, tipo, img }: Props) => (
  <article className="group flex h-full w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-2xl">
    <div className="relative aspect-[4/3] overflow-hidden bg-celeste-100">
      <SafeImage
        src={img}
        fallback="/wpp.jpg"
        alt={`Imagen del grupo ${titulo}`}
        fill
        sizes="(max-width: 640px) 90vw, 384px"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-celeste-950/70 via-transparent to-transparent" />
      {tipo && (
        <span className="absolute left-4 top-4 rounded-full bg-sol px-3 py-1 text-xs font-bold text-celeste-950 shadow">
          {tipo}
        </span>
      )}
      <span
        aria-hidden="true"
        className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-3xl text-white shadow-lg transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
      >
        <IoLogoWhatsapp />
      </span>
    </div>

    <div className="flex flex-1 flex-col p-6">
      <h3 className="text-xl font-bold leading-snug text-celeste-950">{titulo}</h3>
      <p className="mt-2 line-clamp-3 text-gray-600">{descripcion}</p>
      <div className="mt-auto pt-5">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full bg-celeste-950 px-6 py-3 font-bold text-white transition-all duration-300 hover:gap-3 hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        Unirme al grupo <IoArrowForwardOutline aria-hidden="true" />
      </Link>
      </div>
    </div>
  </article>
);
