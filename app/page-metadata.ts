import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://243drc.com";

export const pageMetadata: Metadata = {
  title: "243 DRC - Plateforme Open Source pour Développeurs Congolais",
  description: "Découvrez, partagez et contribuez aux projets open-source de la communauté tech congolaise. Plateforme dédiée aux développeurs de la RDC (République Démocratique du Congo).",
  openGraph: {
    title: "243 DRC - Plateforme Open Source pour Développeurs Congolais",
    description: "Découvrez, partagez et contribuez aux projets open-source de la communauté tech congolaise.",
    url: siteUrl,
    siteName: "243 DRC",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "243 DRC - Plateforme Open Source pour Développeurs Congolais",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "243 DRC - Plateforme Open Source pour Développeurs Congolais",
    description: "Découvrez, partagez et contribuez aux projets open-source de la communauté tech congolaise.",
    images: ["/og-image.png"],
  },
};

