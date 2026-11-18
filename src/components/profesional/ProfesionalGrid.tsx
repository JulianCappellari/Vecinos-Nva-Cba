"use client";
import { Profesional } from "@/interfaces";
import { Paginacion, ProfesionalCard } from "..";
import { useState } from "react";
import AnimatedOnScroll from "../ui/AnimateScroll";

interface Props {
  profesionales: Profesional[];
  totalPaginas: number;
}

export const ProfesionalGrid = ({ profesionales, totalPaginas }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const filteredProfesional = profesionales.filter(
    (profesional) =>
      profesional.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      profesional.apellido.toLowerCase().includes(searchText.toLowerCase()) ||
      profesional.trabajo.some((t) =>
        t.toLowerCase().includes(searchText.toLowerCase())
      )
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
        placeholder="Buscar profesional..."
        value={searchText}
        onChange={handleSearchChange}
        className="w-full max-w-md p-3 border rounded-full px-5 bg-white shadow mb-12"
      />

      {/* Lista de lugares filtrados */}
      <div className="grid w-full max-w-7xl grid-cols-1 justify-items-center gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProfesional.map((profesional) => (
          <AnimatedOnScroll key={profesional.numero} animationClass="animate__fadeInUp">

            <ProfesionalCard  profesional={profesional} />
          </AnimatedOnScroll>
        ))}
      </div>
      {!isSearching && <Paginacion totalPaginas={totalPaginas} />}
    </div>

    // <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 m-8">
    //   {profesionales.map((profesional) => (
    //     <ProfesionalCard key={profesional.numero} profesional={profesional} />
    //   ))}
    // </div>
  );
};
