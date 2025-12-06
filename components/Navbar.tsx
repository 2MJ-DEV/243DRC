"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import AuthButton from "./AuthButton";
import { GithubIcon } from "lucide-react";
import { useBanner } from "@/context/BannerContext";

const Navbar = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isDarkBackground, setIsDarkBackground] = useState(false);
  const { isBannerVisible } = useBanner();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Déterminer si la navbar est au-dessus d'un fond sombre
      // Ajustez ces valeurs selon les sections de votre page
      const heroHeight = 600; // Hauteur approximative de votre hero section
      
      if (scrollY > heroHeight) {
        setIsDarkBackground(true);
      } else {
        setIsDarkBackground(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initialiser l'état au chargement

    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollY]);

  return (
    <>
      <div className={`fixed left-0 right-0 z-40 px-4 transition-all duration-300 ${
        isBannerVisible ? 'md:top-[52px] top-[2 4px]' : 'md:top-3 top-0'
      }`}>
        <div 
          className={`
            max-w-6xl backdrop-blur border md:rounded-2xl px-4 mx-auto 
            flex h-14 items-center justify-between transition-colors duration-300
            ${isDarkBackground 
              ? "border-white/20 bg-black/5 dark:bg-white/5" 
              : "border-black/10 dark:border-white/20 bg-white/5 dark:bg-black/5"
            }
          `}
        >
          <div className="flex items-center">
            <Image
              src="/flag-rdc.png"
              alt="Drapeau de la RDC"
              width={32}
              height={20}
            />
            {/* <h1 className="text-xl font-bold text-foreground">
              <span className="text-[#EFDA5B]">243</span>
              <span className="text-[#007FFF]">RDC</span>
            </h1> */}
          </div>

          <div className="flex items-center font-sans space-x-3">
            <Button variant="default">
              <GithubIcon />
              <span className="hidden sm:inline">Contribuer</span>
            </Button>

            <AuthButton />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
