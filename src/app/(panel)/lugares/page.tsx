
import { getLugarPaginacion } from "@/actions/lugar/get-lugar-paginacion";
import { LugarGrid, Paginacion } from "@/components";
import { PageHeader } from "@/components/ui/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lugares de Nueva cordoba",
  description: "Lugares a los cuales puedes conocer o probar",
};

interface Props {
  searchParams: {
    page?: string;
  };
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
