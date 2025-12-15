import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://243drc.com";
const siteName = "243 DRC - Plateforme Open Source pour Développeurs Congolais";
const siteDescription = "Découvrez, partagez et contribuez aux projets open-source de la communauté tech congolaise. Plateforme dédiée aux développeurs de la RDC (République Démocratique du Congo).";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "243drc",
    "drc",
    "rdc",
    "243",
    "jules mukadi",
    "2mj",
    "demj-dev",
    "développeurs congolais",
    "open source",
    "projets open source",
    "République Démocratique du Congo",
    "développement logiciel",
    "communauté tech",
    "programmation",
    "développeurs RDC",
    "tech congolaise",
    "innovation RDC",
    "code open source",
    "Jules Mukadi",
    "2MJ-DEV",
    "DEMJ-DEV",
  ],
  authors: [
    { name: "Jules Mukadi", url: "https://github.com/2MJ-DEV" },
    { name: "2MJ-DEV", url: "https://github.com/2MJ-DEV" },
  ],
  creator: "Jules Mukadi (2MJ-DEV)",
  publisher: "243 DRC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "243 DRC - Plateforme Open Source pour Développeurs Congolais",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og-image.png"],
    creator: "@243DRC",
    site: "@243DRC",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  other: {
    "linkedin:owner": "243DRC",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  url: siteUrl,
                  name: siteName,
                  description: siteDescription,
                  publisher: {
                    "@id": `${siteUrl}/#organization`,
                  },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${siteUrl}/explorer-les-projets?search={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                  inLanguage: "fr-FR",
                },
                {
                  "@type": "Organization",
                  "@id": `${siteUrl}/#organization`,
                  name: "243 DRC",
                  url: siteUrl,
                  logo: {
                    "@type": "ImageObject",
                    url: `${siteUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                  },
                  sameAs: ["https://github.com/2MJ-DEV/243DRC"],
                },
                {
                  "@type": "Person",
                  "@id": `${siteUrl}/#person`,
                  name: "Jules Mukadi",
                  alternateName: ["2MJ-DEV", "demj-dev"],
                  url: "https://github.com/2MJ-DEV",
                  sameAs: ["https://github.com/2MJ-DEV"],
                  jobTitle: "Développeur",
                  worksFor: {
                    "@id": `${siteUrl}/#organization`,
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <ClientLayout>{children}</ClientLayout>
    </html>
  );
}
