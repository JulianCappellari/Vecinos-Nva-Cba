"use client";
import React, { use, useState } from "react";
import { Lugar } from "@/interfaces";
import { LugarCard, Paginacion } from "..";
import AnimatedOnScroll from "../ui/AnimateScroll";
import { LugarCard2 } from "./LugarCard2";

interface Props {
  lugares: Lugar[];
  totalPaginas: number;
}

export const LugarGrid = ({ lugares, totalPaginas }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const filteredLugares = lugares.filter(
    (lugar) =>
      lugar.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      lugar.barrio.toLowerCase().includes(searchText.toLowerCase())
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
        placeholder="Buscar lugar..."
        value={searchText}
        onChange={handleSearchChange}
        className="w-full max-w-md p-3 border rounded-full px-5 bg-white shadow mb-12"
      />

      {/* Lista de lugares filtrados */}
      <div className="grid w-full max-w-7xl grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredLugares.map((lugar) => (
          <AnimatedOnScroll
            key={lugar.nombre + lugar.barrio}
            animationClass="animate__fadeInUp"
          >
            <LugarCard lugar={lugar} />
          </AnimatedOnScroll>
        ))}
      </div>
      {!isSearching && <Paginacion totalPaginas={totalPaginas} />}
    </div>
  );
};
