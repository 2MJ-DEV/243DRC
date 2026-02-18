import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "243 DRC - Plateforme Open Source pour Developpeurs Congolais",
    short_name: "243 DRC",
    description:
      "Decouvrez, partagez et contribuez aux projets open-source de la communaute tech congolaise",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#007FFF",
    categories: ["social", "developer", "productivity"],
    icons: [
      {
        src: "/flag-rdc.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
