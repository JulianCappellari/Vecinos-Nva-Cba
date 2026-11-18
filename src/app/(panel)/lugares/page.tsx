
import { getLugarPaginacion } from "@/actions/lugar/get-lugar-paginacion";
import { LugarGrid, Paginacion } from "@/components";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

interface Props {
  searchParams: {
    page?: string;
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const n = Number(searchParams.page) > 1 ? Math.floor(Number(searchParams.page)) : 1;
  return pageMeta({
    title: n > 1 ? `Lugares para conocer en Nueva Córdoba (página ${n})` : "Lugares para conocer en Nueva Córdoba",
    description: "Bares, cafés, plazas y rincones de Nueva Córdoba con dirección, fotos y tipo de lugar. Descubrí qué visitar en el barrio.",
    path: n > 1 ? `/lugares?page=${n}` : "/lugares",
    image: "/capuchinos.jpg",
  });
}

export default async function LugaresPage({ searchParams }: Props) {
  const pagina = searchParams.page ? parseInt(searchParams.page) : 1;
  const { lugares, totalPaginas, currentPage } = await getLugarPaginacion({
    pagina,
  });
  return (
    <div>
      <PageHeader titulo="Lugares" subtitulo="Sitios de Nueva Córdoba para conocer, probar y volver." img="/capuchinos.jpg" />
      <LugarGrid lugares={lugares} totalPaginas={totalPaginas} />
    </div>
  );
}
