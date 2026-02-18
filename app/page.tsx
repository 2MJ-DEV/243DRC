"use client";

import { useEffect, useState } from "react";
import CallToAction from "@/components/call-to-action";
import FeaturedProject from "@/components/FeaturedProject";
import Hero from "@/components/Hero";
import HomeProjectOverview from "@/components/HomeProjectOverview";
import PreviewApp from "@/components/Preview-App";
import { WelcomeModal } from "@/components/WelcomeModal";

export default function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    const forceWelcomeInDev = process.env.NODE_ENV === "development";

    if (forceWelcomeInDev || !hasSeenWelcome) {
      const timeoutId = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  const handleCloseWelcomeModal = (dontShowAgain: boolean) => {
    setShowWelcomeModal(false);
    if (dontShowAgain) {
      localStorage.setItem("hasSeenWelcome", "true");
    }
  };

  return (
    <>
      <div className="sr-only">
        <h1>243 DRC - Plateforme Open Source pour Developpeurs Congolais</h1>
        <p>
          243 DRC est la plateforme de reference pour les developpeurs de la Republique Democratique du Congo.
          Creee par Jules Mukadi (2MJ-DEV), cette plateforme permet de decouvrir, partager et contribuer aux projets open-source
          de la communaute tech congolaise.
        </p>
      </div>

      <Hero />
      <HomeProjectOverview />
      <PreviewApp />
      <FeaturedProject />
      <CallToAction />

      <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseWelcomeModal} />
    </>
  );
}

