"use client";
import { Grupo } from "@/interfaces";
import { GrupoCard, Paginacion } from "..";
import { useState } from "react";
import AnimatedOnScroll from "../ui/AnimateScroll";
import { GrupoCard2 } from "./GrupoCard2";

interface Props {
  grupos: Grupo[];
  totalPaginas: number
}

export const GrupoGrid = ({ grupos, totalPaginas }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false)

  const filteredGrupos = grupos.filter(
    (grupo) =>
      grupo.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      grupo.tipo.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    setIsSearching(value.length > 0);
  };
  return (
    <div className="mx-4 my-8 sm:m-8 flex flex-col justify-center items-center">
      {/* Campo de búsqueda */}
      <input
        type="text"
        placeholder="Buscar grupo..."
        value={searchText}
        onChange={handleSearchChange}
        className="w-full max-w-md p-3 border rounded-full px-5 bg-white shadow mb-12"
      />

      {/* Lista de grupos filtrados */}
      <div className="grid w-full max-w-7xl grid-cols-1 justify-items-center gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGrupos.map((grupo) => (
          <AnimatedOnScroll key={grupo.url} animationClass="animate__fadeInUp">

            {/* <GrupoCard  titulo={grupo.nombre} descripcion={grupo.descripcion} url={grupo.url} img={grupo.imagen ?? '/wpp.jpg'} tipo={grupo.tipo} /> */}
            <GrupoCard2  titulo={grupo.nombre} descripcion={grupo.descripcion} url={grupo.url} img={grupo.imagen ?? '/wpp.jpg'} tipo={grupo.tipo} />
          </AnimatedOnScroll>
        ))}
      </div>
      {!isSearching && <Paginacion totalPaginas={totalPaginas} />}
    </div>

    // <div className='grid grid-cols-2 sm:grid-cols-3 gap-10 m-10 p-3'>
    //   {
    //     grupos.map( grupo => (
    //         <Card key={grupo.url} titulo={grupo.nombre} descripcion={grupo.descripcion} url={grupo.url} img={grupo.imagen ?? '/wpp.jpg'} tipo={grupo.tipo} />
    //     ))
    //   }
    // </div>
  );
};
