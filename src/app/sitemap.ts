import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { FEATURES } from "@/lib/community/schema";
import { IS_DEMO, SITE_URL } from "@/lib/seo";

// Se arma en cada consulta para incluir los lugares y profesionales nuevos.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (IS_DEMO) return [];

  const now = new Date();
  type Freq = "daily" | "weekly" | "monthly";
  const entrada = (path: string, changeFrequency: Freq, priority: number): MetadataRoute.Sitemap[number] => ({
    url: SITE_URL + path, lastModified: now, changeFrequency, priority,
  });
  const fijas: MetadataRoute.Sitemap = [
    entrada("/", "daily", 1),
    entrada("/grupos", "daily", 0.9),
    entrada("/profesionales", "daily", 0.9),
    entrada("/lugares", "daily", 0.9),
    entrada("/comunidad", "daily", 0.9),
    ...FEATURES.map((f) => entrada(`/comunidad/${f.slug}`, "daily", 0.7)),
    entrada("/nosotros", "monthly", 0.5),
  ];

  try {
    const [lugares, profesionales] = await Promise.all([
      prisma.lugar.findMany({ select: { id: true } }),
      prisma.profesional.findMany({ select: { nombre: true, apellido: true } }),
    ]);
    return [
      ...fijas,
      ...lugares.map((l) => ({ url: `${SITE_URL}/lugar/${l.id}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
      ...profesionales.map((p) => ({
        url: `${SITE_URL}/profesional/${encodeURIComponent(`${p.nombre}-${p.apellido}`)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // Si la base no responde, el mapa sigue sirviendo las páginas fijas.
    return fijas;
  }
}
