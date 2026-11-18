import Link from "next/link";
import { notFound } from "next/navigation";
import { IoLocationOutline, IoMapOutline, IoPricetagOutline } from "react-icons/io5";
import { getLugarById } from "@/actions/lugar/get-lugar-by-id";
import { Galeria } from "@/components/lugar/Galeria";
import { Reveal, SplitHeading } from "@/components/ui/motion";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { fontTitulo } from "@/config/fonts";

interface Props {
  params: { id: string };
}

export default async function LugarPage({ params }: Props) {
  const lugar = await getLugarById(params.id);
  if (!lugar) notFound();

  const direccion = lugar.direccion
    .map((d) => (d.altura ? `${d.calle} ${d.altura}` : d.calle))
    .join(", ");
  const mapa =
    lugar.localizacion && lugar.localizacion !== "undefined" && lugar.localizacion.trim() !== ""
      ? lugar.localizacion
      : null;

  return (
    <div className="overflow-x-clip">
      <section className="bg-celeste-950 px-5 pb-10 pt-12 text-white sm:px-8 md:pb-14 md:pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-sky-200">{lugar.barrio}</p>
          <SplitHeading
            as="h1"
            onLoad
            text={lugar.nombre}
            className={`${fontTitulo.className} mt-2 text-[clamp(2.5rem,8vw,6rem)] uppercase leading-none`}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.6fr_1fr] lg:py-16">
        <Reveal variant="left" className="min-w-0 lg:-mt-24">
          <Galeria imagenes={lugar.imagenes.map((i) => i.url as string)} titulo={lugar.nombre} />
        </Reveal>

        <Reveal variant="right" className="min-w-0">
          <div className="space-y-6 rounded-2xl bg-white p-6 shadow-xl sm:p-8">
            <div className="flex gap-4">
              <IoLocationOutline className="mt-1 h-6 w-6 shrink-0 text-sky-500" />
              <div>
                <h2 className="font-bold text-celeste-950">Dirección</h2>
                <p className="text-gray-700">{direccion || "Sin dirección cargada"}</p>
              </div>
            </div>
            {lugar.tipo.length > 0 && (
              <div className="flex gap-4">
                <IoPricetagOutline className="mt-1 h-6 w-6 shrink-0 text-sky-500" />
                <div>
                  <h2 className="font-bold text-celeste-950">Tipo de lugar</h2>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {lugar.tipo.map((t) => (
                      <li key={t} className="rounded-full bg-celeste-100 px-3 py-1 text-sm text-celeste-800">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {mapa && (
              <Link
                href={mapa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-sol px-6 py-3 font-bold text-celeste-950 transition hover:-translate-y-0.5 hover:bg-celeste-950 hover:text-white"
              >
                <IoMapOutline className="h-5 w-5" /> Ver en el mapa
              </Link>
            )}
            {lugar.redes && lugar.redes.length > 0 && (
              <div>
                <h2 className="mb-3 font-bold text-celeste-950">Redes</h2>
                <SocialLinks redes={lugar.redes} />
              </div>
            )}
          </div>
        </Reveal>
      </section>

      <div className="pb-16 text-center">
        <Link href="/lugares" className="font-bold text-celeste-700 underline underline-offset-4 hover:text-celeste-950">
          Volver a lugares
        </Link>
      </div>
    </div>
  );
}
