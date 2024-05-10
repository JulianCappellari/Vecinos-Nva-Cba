import { Lugar } from "@/interfaces";
import Image from "next/image";
import Link from "next/link";
// Asegúrate de importar la interfaz Lugar desde el archivo correcto

interface Props {
    lugar: Lugar;
}

export const LugarCard = ({ lugar }: Props) => {
  const { nombre, zona, direccion, tipo, imagenes, redes } = lugar;

  return (
    <div>
      <div className="relative flex w-96 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md ">
        <div className="relative mx-4 -mt-6 h-56 overflow-hidden rounded-xl bg-blue-gray-500 bg-clip-border text-white shadow-lg shadow-blue-gray-500/40">
          <Image
            src={'/wpp.jpg'}
            alt={nombre}
            layout="fill"
          />
        </div>
        <div className="pt-6 px-6">
          <h5 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
            {nombre} {/* Destacar el nombre */}
          </h5>
          <p className="block font-sans text-sm font-medium text-gray-500 uppercase mb-2">
            Zona: {zona} {/* Destacar la zona */}
          </p>
          <p className="block font-sans text-sm font-medium text-gray-500 mb-4">
            Dirección: {direccion.map(direccion => `${direccion.calle} ${direccion.altura}`).join(', ')} {/* Destacar la dirección */}
          </p>
          <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
            {zona}
          </p>
        </div>
        {tipo && (
        <div className="flex justify-start m-4 pl-2">
          {
            tipo.map(tipo=> (

              <span key={tipo} className="bg-gray-500 text-white py-1 px-2 rounded-md text-sm">{tipo}</span>
            ))
          }
        </div>
      )}
      {redes && (
        <div className="flex justify-start m-4 pl-2">
          {redes.map((red, index) => (
            <a key={index} href={red.url} className="bg-gray-500 text-white py-1 px-2 rounded-md text-sm mr-2">
              {red.tipo}
            </a>
          ))}
        </div>
      )}
        <div className="p-6 pt-0">
          <Link
            className="select-none rounded-lg bg-sky-500 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
            data-ripple-light="true"
            href={`/lugar/${lugar.id}`}
          >
            Ver más
          </Link>
        </div>
      </div>
    </div>
  );
};