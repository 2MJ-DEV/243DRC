"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://243drc.com";
const siteName = "243 DRC - Plateforme Open Source pour Développeurs Congolais";
const siteDescription = "Découvrez, partagez et contribuez aux projets open-source de la communauté tech congolaise. Plateforme dédiée aux développeurs de la RDC (République Démocratique du Congo).";

export default function StructuredData() {
  const pathname = usePathname();

  useEffect(() => {
    const currentUrl = `${siteUrl}${pathname === "/" ? "" : pathname}`;

    // Données structurées JSON-LD
    const jsonLd = {
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
          sameAs: [
            "https://github.com/2MJ-DEV/243DRC",
          ],
        },
        {
          "@type": "Person",
          "@id": `${siteUrl}/#person`,
          name: "Jules Mukadi",
          alternateName: ["2MJ-DEV", "demj-dev"],
          url: "https://github.com/2MJ-DEV",
          sameAs: [
            "https://github.com/2MJ-DEV",
          ],
          jobTitle: "Développeur",
          worksFor: {
            "@id": `${siteUrl}/#organization`,
          },
        },
        {
          "@type": "WebPage",
          "@id": `${currentUrl}#webpage`,
          url: currentUrl,
          name: siteName,
          description: siteDescription,
          isPartOf: {
            "@id": `${siteUrl}/#website`,
          },
          about: {
            "@id": `${siteUrl}/#organization`,
          },
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: `${siteUrl}/og-image.png`,
          },
          inLanguage: "fr-FR",
        },
      ],
    };

    // Supprimer l'ancien script s'il existe
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Ajouter le nouveau script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}

