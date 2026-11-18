import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/community/schema";
import { BudgetGuide, Listing, type SearchParams } from "@/components/community/Listing";
import { WelcomeGuide } from "@/components/community/WelcomeGuide";
import { PageHeader } from "@/components/ui/PageHeader";
import { pageMeta } from "@/lib/seo";

// Títulos pensados para lo que la gente busca en Google (el nombre corto de cada área se usa dentro de la página).
const SEO: Record<string, { title: string; description: string }> = {
  planes: { title: "Planes para conocer gente en Nueva Córdoba", description: "Encuentros para conocer gente en Nueva Córdoba: mates, deportes, paseos e idiomas. Venir solo también es un buen plan." },
  estudio: { title: "Mesas y compañeros de estudio en Córdoba", description: "Buscá compañeros de estudio en Córdoba por universidad, carrera y materia, o armá una mesa para tu próximo parcial o final." },
  bienvenida: { title: "Guía para recién llegados a Nueva Córdoba", description: "Una guía a tu medida para instalarte en Nueva Córdoba: conocer gente, organizar el estudio, armar tu casa y cuidar el presupuesto." },
  presupuesto: { title: "Estudiar en Córdoba con poca plata", description: "Ideas gratuitas y beneficios con precio, condiciones y vencimiento claros para estudiantes en Córdoba." },
  origenes: { title: "Grupos de estudiantes por provincia en Córdoba", description: "Encontrá grupos de WhatsApp de estudiantes de tu provincia que viven o estudian en Córdoba, por interés y ciudad de origen." },
  intercambio: { title: "Venta, donación e intercambio entre estudiantes", description: "Muebles, libros y cosas para el departamento: vendé, donalo o intercambialo con otros estudiantes de Córdoba." },
};

export function generateMetadata({ params }: { params: { seccion: string } }) {
  const feature = FEATURES.find((f) => f.slug === params.seccion);
  if (!feature) return { title: "Comunidad", robots: { index: false, follow: true } };
  const seo = SEO[feature.slug] ?? { title: feature.title, description: feature.description };
  return pageMeta({ ...seo, path: `/comunidad/${feature.slug}`, image: feature.image });
}

export default function FeaturePage({
  params,
  searchParams,
}: {
  params: { seccion: string };
  searchParams: SearchParams;
}) {
  const feature = FEATURES.find((f) => f.slug === params.seccion);
  if (!feature) notFound();

  return (
    <>
      <PageHeader titulo={feature.title} subtitulo={feature.subtitle + " " + feature.description} img={feature.image} />
      <div className="community-container">
        {feature.slug === "bienvenida" ? (
          <WelcomeGuide />
        ) : (
          <>
            <div className="community-page-heading">
              <p>Publicá lo tuyo o buscá lo que necesitás.</p>
              <Link className="c-button yellow" href={"/comunidad/publicar?tipo=" + feature.kind}>
                {feature.action}
              </Link>
            </div>
            {feature.slug === "presupuesto" ? <BudgetGuide /> : null}
            <Listing kind={feature.kind!} searchParams={searchParams} />
          </>
        )}
      </div>
    </>
  );
}
