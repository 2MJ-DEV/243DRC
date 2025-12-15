"use client";

import { useEffect, useState } from "react";
import CallToAction from "@/components/call-to-action";
import FeaturedProject from "@/components/FeaturedProject";
import Hero from "@/components/Hero";
import PreviewApp from "@/components/Preview-App";
import { WelcomeModal } from "@/components/WelcomeModal";

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu la modale
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      // Attendre un peu pour que la page soit chargée
      setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1000);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <>
      {/* Contenu SEO optimisé */}
      <div className="sr-only">
        <h1>243 DRC - Plateforme Open Source pour Développeurs Congolais</h1>
        <p>
          243 DRC est la plateforme de référence pour les développeurs de la République Démocratique du Congo. 
          Créée par Jules Mukadi (2MJ-DEV), cette plateforme permet de découvrir, partager et contribuer aux projets open-source 
          de la communauté tech congolaise. Rejoignez la communauté des développeurs RDC et boostez l'innovation open source en RDC.
        </p>
        <p>
          Mots-clés : 243drc, drc, rdc, 243, jules mukadi, 2mj, demj-dev, développeurs congolais, open source, 
          projets open source, République Démocratique du Congo, développement logiciel, communauté tech, 
          programmation, développeurs RDC, tech congolaise, innovation RDC, code open source.
        </p>
      </div>

      <Hero />
      <PreviewApp />
      <FeaturedProject />
      <CallToAction />
      
      {/* Welcome Modal */}
      <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseWelcomeModal} />
    </>
  );
}
