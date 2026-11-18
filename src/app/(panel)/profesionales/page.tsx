
import { getProfesionalPaginacion } from "@/actions/profesional/get-profecional-paginacion";
import { Paginacion, ProfesionalGrid } from "@/components";

import { PageHeader } from "@/components/ui/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profesionales",
  description: "Profesionales a los cuales puedes contactar segun lo que necesites",
};
interface Props {
  searchParams: {
    page?: string
  }
}

export default async function ProfesionalesPage({searchParams}: Props) {
  const pagina = searchParams.page ? parseInt(searchParams.page) : 1
  const {profesionales, totalPaginas, currentPage} = await getProfesionalPaginacion({pagina})
  return (
    <div>
      <PageHeader titulo="Profesionales" subtitulo="Encontrá quién te ayude, con teléfono y redes a mano." img="/panoramica-dorada.jpg" />
      <ProfesionalGrid profesionales={profesionales} totalPaginas={totalPaginas}/>
      
    </div>
  );
}