
import { getProfesionalPaginacion } from "@/actions/profesional/get-profecional-paginacion";
import { Paginacion, ProfesionalGrid } from "@/components";

import { PageHeader } from "@/components/ui/PageHeader";
import { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

interface Props {
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const n = Number(searchParams.page) > 1 ? Math.floor(Number(searchParams.page)) : 1;
  return pageMeta({
    title: n > 1 ? `Profesionales y oficios en Nueva Córdoba (página ${n})` : "Profesionales y oficios en Nueva Córdoba",
    description: "Directorio de profesionales y oficios de Nueva Córdoba, Córdoba, con contacto por WhatsApp y redes. Encontrá quién te ayude cerca de casa.",
    path: n > 1 ? `/profesionales?page=${n}` : "/profesionales",
    image: "/panoramica-dorada.jpg",
  });
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