import type { MetadataRoute } from "next";
import { IS_DEMO, SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // La copia de muestra no debe aparecer en ningún buscador.
  if (IS_DEMO) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
