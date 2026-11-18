import type { Metadata, Viewport } from "next";
import { Inter, Alatsi, Acme,Alata } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { fontTitulo } from "@/config/fonts";

const inter = Inter({ subsets: ["latin"] });
const alatsi = Alatsi({ subsets: ["latin"], weight: "400", variable: "--font-alatsi", display: "swap" });
const acme = Acme({ subsets: ["latin"], weight: "400", variable: "--font-alatsi", display: "swap" });

const alata = Alata({ subsets: ["latin"], weight: "400", variable: "--font-alata", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Vecinos de Nueva Córdoba",
  description: "Ayudando a conectar la vecindad",
  manifest: "/manifest.webmanifest",
  // La copia de muestra no debe aparecer en buscadores.
  ...(process.env.DEMO_MODE === "1" ? { robots: { index: false, follow: false } } : {}),
  icons: {
    icon: [
      { url: "/brand/la-esquina/iconos/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/la-esquina/iconos/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/la-esquina/iconos/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/brand/la-esquina/iconos/favicon.ico",
    apple: "/brand/la-esquina/iconos/apple-touch-icon.png",
  },
  openGraph: {
    title: "Vecinos de Nueva Córdoba",
    description: "Ayudando a conectar la vecindad",
    locale: "es_AR",
    type: "website",
    images: [{ url: "/brand/la-esquina/redes/compartir-color-1200x630.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/la-esquina/redes/compartir-color-1200x630.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#062b4b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${alata.className} ${alata.variable} ${fontTitulo.variable}`}>
        <SmoothScroll />
        {children}
        {process.env.DEMO_MODE === "1" && (
          <p className="fixed bottom-3 left-3 z-[70] rounded-full bg-sol px-4 py-1.5 text-xs font-bold text-celeste-950 shadow-lg">
            Sitio de muestra · datos e imágenes ficticios
          </p>
        )}
      </body>
    </html>
  );
}
