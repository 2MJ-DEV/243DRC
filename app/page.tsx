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
      <Hero />
      <PreviewApp />
      <FeaturedProject />
      <CallToAction />
      
      {/* Welcome Modal */}
      <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseWelcomeModal} />
    </>
  );
}
