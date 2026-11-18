import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SITE_NAME = "Vecinos de Nueva Córdoba";
export const IS_DEMO = process.env.DEMO_MODE === "1";

export const DEFAULT_DESCRIPTION =
  "Directorio de vecinos de Nueva Córdoba: grupos de WhatsApp, profesionales, lugares del barrio y una comunidad para estudiantes que llegan a Córdoba.";

export const OG_IMAGE = "/brand/la-esquina/redes/compartir-color-1200x630.jpg";

/** Convierte una ruta (o una URL) en una URL absoluta del sitio. */
export const abs = (path: string) => (/^https?:\/\//.test(path) ? path : SITE_URL + (path.startsWith("/") ? path : "/" + path));

/** Recorta un texto para que entre en una meta descripción (unos 155 caracteres). */
export const clip = (text: string, max = 155) => {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
};

interface PageMetaInput {
  title: string;
  description: string;
  /** Ruta canónica, por ejemplo "/grupos" o "/grupos?page=2". */
  path: string;
  image?: string;
  noindex?: boolean;
  type?: "website" | "article";
}

/** Metadatos completos de una página: título, descripción, canónica, Open Graph y Twitter. */
export function pageMeta({ title, description, path, image, noindex = false, type = "website" }: PageMetaInput): Metadata {
  const img = image ?? OG_IMAGE;
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      locale: "es_AR",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: path,
      images: [{ url: img, ...(img === OG_IMAGE ? { width: 1200, height: 630 } : {}), alt: title }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [img] },
  };
}

/** Migas de pan en formato schema.org. */
export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
});
