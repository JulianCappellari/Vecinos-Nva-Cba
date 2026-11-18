import type { Metadata, Viewport } from "next";
import { Inter, Alatsi, Acme,Alata } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { fontTitulo } from "@/config/fonts";
import { JsonLd } from "@/components/seo/JsonLd";
import { abs, DEFAULT_DESCRIPTION, IS_DEMO, OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"] });
const alatsi = Alatsi({ subsets: ["latin"], weight: "400", variable: "--font-alatsi", display: "swap" });
const acme = Acme({ subsets: ["latin"], weight: "400", variable: "--font-alatsi", display: "swap" });

const alata = Alata({ subsets: ["latin"], weight: "400", variable: "--font-alata", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Grupos, profesionales y lugares`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Nueva Córdoba",
    "vecinos de Nueva Córdoba",
    "grupos de WhatsApp Córdoba",
    "profesionales en Nueva Córdoba",
    "lugares de Nueva Córdoba",
    "estudiar en Córdoba",
    "vida estudiantil Córdoba",
    "comunidad de estudiantes",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  category: "community",
  formatDetection: { telephone: false, email: false, address: false },
  manifest: "/manifest.webmanifest",
  // La copia de muestra no debe aparecer en buscadores.
  robots: IS_DEMO
    ? { index: false, follow: false }
    : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  // Para verificar el sitio en Google Search Console (variable opcional).
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
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
    title: `${SITE_NAME} | Grupos, profesionales y lugares`,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    url: "/",
    locale: "es_AR",
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Grupos, profesionales y lugares`,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const jsonLdSitio = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#sitio`,
    url: SITE_URL,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "es-AR",
    publisher: { "@id": `${SITE_URL}/#organizacion` },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organizacion`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: abs("/brand/la-esquina/iconos/icon-512.png"),
    areaServed: { "@type": "Place", name: "Nueva Córdoba, Córdoba, Argentina" },
    sameAs: ["https://www.instagram.com/vecinosdenuevacordoba/", "https://x.com/vecinosdenvacba"],
  },
];

export const viewport: Viewport = {
  themeColor: "#062b4b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR">
      <body className={`${alata.className} ${alata.variable} ${fontTitulo.variable}`}>
        <JsonLd data={jsonLdSitio} />
        <SmoothScroll />
        {children}
        {IS_DEMO && (
          <p className="fixed bottom-3 left-3 z-[70] rounded-full bg-sol px-4 py-1.5 text-xs font-bold text-celeste-950 shadow-lg">
            Sitio de muestra · datos e imágenes ficticios
          </p>
        )}
      </body>
    </html>
  );
}
