"use client";
import React, { useState } from "react";
import { GrupoNuevo } from "./ui/GrupoNuevo";
import { ProfesionalNuevo } from "./ui/ProfesionalNuevo";
import { LugarNuevo } from "./ui/LugarNuevo";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/motion";

const TIPOS = [
  { id: "grupo", label: "Grupo" },
  { id: "profesional", label: "Profesional" },
  { id: "lugar", label: "Lugar" },
] as const;

const NuevoPage = () => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("grupo");

  return (
    <div>
      <PageHeader
        titulo="Registrar nuevo"
        subtitulo="Sumá tu grupo, tu servicio o tu local para que los vecinos te encuentren."
        img="/esquina-atardecer.jpg"
      />
      <div className="flex flex-col items-center px-4 pb-20 pt-10">
        <div
          role="tablist"
          aria-label="Qué querés registrar"
          className="mb-10 flex w-full max-w-md gap-1 rounded-full bg-celeste-950 p-1.5 shadow-lg"
        >
          {TIPOS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tipoSeleccionado === t.id}
              onClick={() => setTipoSeleccionado(t.id)}
              className={`flex-1 rounded-full px-3 py-2.5 font-bold transition-all duration-300 ${
                tipoSeleccionado === t.id
                  ? "bg-sol text-celeste-950 shadow"
                  : "text-sky-100 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Reveal key={tipoSeleccionado} variant="up" className="form-skin w-full">
          {tipoSeleccionado === "grupo" && <GrupoNuevo />}
          {tipoSeleccionado === "profesional" && <ProfesionalNuevo />}
          {tipoSeleccionado === "lugar" && <LugarNuevo />}
        </Reveal>
      </div>
    </div>
  );
};

export default NuevoPage;
