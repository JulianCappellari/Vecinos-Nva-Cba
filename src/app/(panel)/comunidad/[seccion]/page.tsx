import Link from "next/link";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/community/schema";
import { BudgetGuide, Listing, type SearchParams } from "@/components/community/Listing";
import { WelcomeGuide } from "@/components/community/WelcomeGuide";
import { PageHeader } from "@/components/ui/PageHeader";

export function generateMetadata({ params }: { params: { seccion: string } }) {
  const feature = FEATURES.find((f) => f.slug === params.seccion);
  return { title: feature?.title || "Comunidad", description: feature?.description };
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
