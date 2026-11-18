import type { Metadata } from "next";

// El formulario de registro no aporta contenido propio para buscadores.
export const metadata: Metadata = {
  title: "Registrar un grupo, un profesional o un lugar",
  description: "Sumá tu grupo, tu servicio o tu local al directorio de Vecinos de Nueva Córdoba.",
  robots: { index: false, follow: true },
};

export default function NuevoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
