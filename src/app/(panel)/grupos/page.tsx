
import { getGrupoPaginacion } from "@/actions/grupo/get-grupo-paginacion";
import { GrupoCard, GrupoGrid, Paginacion } from "@/components";

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
    title: n > 1 ? `Grupos de WhatsApp en Nueva Córdoba (página ${n})` : "Grupos de WhatsApp en Nueva Córdoba",
    description: "Encontrá grupos de WhatsApp de Nueva Córdoba por interés: deporte, estudio, cultura, idiomas y más. Sumate y conocé a tus vecinos.",
    path: n > 1 ? `/grupos?page=${n}` : "/grupos",
    image: "/esquina-atardecer.jpg",
  });
}


export default async function GruposPage({searchParams}: Props) {
  const pagina = searchParams.page ? parseInt(searchParams.page) : 1
  const {grupos, totalPaginas, currentPage} = await getGrupoPaginacion({pagina})
  // console.log({ totalPaginas, currentPage})
  return (
    <div>
      <PageHeader titulo="Grupos" subtitulo="Elegí un grupo de WhatsApp según tus intereses y empezá a conocer a tus vecinos." img="/esquina-atardecer.jpg" />
      <GrupoGrid grupos={grupos} totalPaginas={totalPaginas}/>
      
    </div>
  );
}