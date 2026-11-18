import { z } from "zod";

export const PROVINCES = ["Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"] as const;
export const KINDS = ["PLAN", "STUDY", "BENEFIT", "GROUP", "EXCHANGE"] as const;
export type PostKind = typeof KINDS[number];
export const FEATURES = [
  { slug: "planes", kind: "PLAN", title: "Me sumo", subtitle: "Un plan, una primera charla.", description: "Encuentros para conocer gente. Venir solo también es un buen plan.", action: "Proponer un plan", image: "/esquina-atardecer.jpg" },
  { slug: "estudio", kind: "STUDY", title: "Estudiamos juntos", subtitle: "La próxima materia, en compañía.", description: "Buscá compañeros por universidad, carrera y materia.", action: "Buscar compañeros", image: "/capuchinos.jpg" },
  { slug: "bienvenida", kind: null, title: "Acabo de llegar", subtitle: "Tu barrio empieza acá.", description: "Una guía a tu medida para instalarte y encontrar tu lugar.", action: "Armar mi guía", image: "/hero-avenida.jpg" },
  { slug: "presupuesto", kind: "BENEFIT", title: "Con poca plata", subtitle: "Más barrio, menos gasto.", description: "Ideas gratuitas y beneficios con condiciones claras.", action: "Compartir un beneficio", image: "/2.jpg" },
  { slug: "origenes", kind: "GROUP", title: "De dónde venís", subtitle: "Algo en común, para empezar.", description: "Encontrá grupos por provincia e intereses.", action: "Sumar un grupo", image: "/panoramica-dorada.jpg" },
  { slug: "intercambio", kind: "EXCHANGE", title: "De estudiante a estudiante", subtitle: "Lo que te falta, puede estar cerca.", description: "Muebles, libros y cosas que merecen otra vuelta.", action: "Publicar un aviso", image: "/capuchinos.jpg" },
] as const;
export type FeatureSlug = typeof FEATURES[number]["slug"];
export const CATEGORIES: Record<PostKind, readonly string[]> = {
  PLAN: ["Mates y charlas", "Deportes", "Cultura", "Idiomas", "Paseos", "Juegos"],
  STUDY: ["Ingreso", "Cursada", "Parcial", "Final", "Idiomas"],
  BENEFIT: ["Comida", "Estudio", "Cultura", "Compras", "Actividad física"],
  GROUP: ["Amistad", "Estudio", "Deportes", "Cultura", "Idiomas"],
  EXCHANGE: ["Muebles", "Libros", "Tecnología", "Hogar", "Otros"],
};
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
export const phoneSchema = z.string().trim().transform(v => v.replace(/[\s()+-]/g, "")).refine(v => /^\d{10,15}$/.test(v), "Usá código de país y entre 10 y 15 dígitos.");
const date = z.string().datetime({ offset: true });
const base = z.object({
  title: text(6, 100), description: text(20, 1600), category: text(2, 60),
  contact: phoneSchema, contactConsent: z.literal(true),
  imageId: z.string().cuid().optional(),
});
export const postSchema = z.discriminatedUnion("kind", [
  base.extend({ kind: z.literal("PLAN"), data: z.object({
    startsAt: date, endsAt: date, capacity: z.number().int().min(2).max(50),
    location: text(5, 180), cost: z.number().int().min(0).max(1000000), welcomeSolo: z.literal(true),
  }).strict() }),
  base.extend({ kind: z.literal("STUDY"), data: z.object({
    university: text(2, 100), career: text(2, 100), subject: text(2, 100),
    availability: text(5, 200), modality: z.enum(["Presencial", "Virtual", "Mixto"]),
    location: text(2, 180), capacity: z.number().int().min(2).max(20),
  }).strict() }),
  base.extend({ kind: z.literal("BENEFIT"), data: z.object({
    merchant: text(2, 100), location: text(5, 180), cost: z.number().int().min(0).max(1000000),
    terms: text(10, 800), expiresAt: date,
  }).strict() }),
  base.extend({ kind: z.literal("GROUP"), data: z.object({
    province: z.enum(PROVINCES), city: text(0, 100), rules: text(15, 800),
    url: z.string().url().max(400).refine(v => { try { const u = new URL(v); return u.protocol === "https:" && u.hostname === "chat.whatsapp.com" && u.pathname.length > 2; } catch { return false; } }, "Ingresá una invitación https://chat.whatsapp.com/…"),
  }).strict() }),
  base.extend({ kind: z.literal("EXCHANGE"), data: z.object({
    operation: z.enum(["Vendo", "Dono", "Intercambio"]), condition: z.enum(["Nuevo", "Muy bueno", "Usado"]),
    price: z.number().int().min(0).max(10000000), zone: text(3, 100),
  }).strict() }),
]);
export type PostInput = z.infer<typeof postSchema>;
export class PostValidationError extends Error {}

export function validatePost(input: unknown, now = new Date()) {
  const value = postSchema.parse(input);
  if (!CATEGORIES[value.kind].includes(value.category)) throw new PostValidationError("Elegí una categoría de la lista.");
  if (value.kind === "PLAN") {
    const start = new Date(value.data.startsAt).getTime(), end = new Date(value.data.endsAt).getTime();
    if (start <= now.getTime() || start > now.getTime() + 180 * 86400000 || end <= start || end - start > 24 * 3600000)
      throw new PostValidationError("El plan debe ser futuro, dentro de seis meses y durar hasta 24 horas.");
  }
  if (value.kind === "BENEFIT") {
    const end = new Date(value.data.expiresAt).getTime();
    if (end <= now.getTime() || end > now.getTime() + 180 * 86400000) throw new PostValidationError("El beneficio debe vencer dentro de los próximos seis meses.");
  }
  if (value.kind === "EXCHANGE" && value.data.operation === "Vendo" && value.data.price <= 0) throw new PostValidationError("Indicá un precio mayor a cero.");
  return value;
}
export function expiryFor(value: PostInput, now = new Date()) {
  if (value.kind === "PLAN") return new Date(value.data.endsAt);
  if (value.kind === "BENEFIT") return new Date(value.data.expiresAt);
  return new Date(now.getTime() + (value.kind === "GROUP" ? 90 : 30) * 86400000);
}
export const registerSchema = z.object({
  name: text(2, 40), email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(10).max(128), province: z.enum(PROVINCES).optional(),
});
export const loginSchema = registerSchema.pick({ email: true, password: true });
export const idSchema = z.string().cuid();
export function safeReturnPath(value: string | null | undefined) {
  return value && /^\/comunidad(?:\/|\?|$)/.test(value) && !value.includes("\\") && !/[\r\n]/.test(value) ? value : "/comunidad";
}
export function normalized(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim(); }
export function formatMoney(value: number) { return value === 0 ? "Gratis" : new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value); }
export function formatDate(value: string) { return new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
