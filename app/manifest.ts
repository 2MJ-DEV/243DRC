import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "243 DRC - Plateforme Open Source pour Développeurs Congolais",
    short_name: "243 DRC",
    description: "Découvrez, partagez et contribuez aux projets open-source de la communauté tech congolaise",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#007FFF",
    icons: [
      {
        src: "/flag-rdc.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}

