/** Inserta datos estructurados (schema.org) en formato JSON-LD. */
export const JsonLd = ({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) => (
  <script
    type="application/ld+json"
    // Se escapa "<" para que el contenido nunca pueda cerrar la etiqueta <script>.
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
  />
);
