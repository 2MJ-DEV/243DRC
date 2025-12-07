import { Button } from "./ui/button";
import Link from "next/link";
import FloatingOrb from "./ui/FloatingOrb";
import GridPattern from "./ui/GridPattern";
import { Send, Telescope } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative w-full overflow-hidden pt-[100px] md:pt-[120px]">
      
        <GridPattern />
        {/* Gradient Orbs flottants */}
        <FloatingOrb
          color="#007FFF"
          size="400px"
          duration="8s"
          delay="0s"
          top="-10%"
          left="-5%"
        />
        <FloatingOrb
          color="#EFDA5B"
          size="350px"
          duration="10s"
          delay="2s"
          top="20%"
          right="-10%"
        />
        <FloatingOrb
          color="#CA3E4B"
          size="300px"
          duration="12s"
          delay="4s"
          bottom="10%"
          left="10%"
        />
        
        {/* Orbs plus petits pour plus de profondeur */}
        <FloatingOrb
          color="#007FFF"
          size="200px"
          duration="9s"
          delay="1s"
          top="50%"
          right="20%"
        />
        <FloatingOrb
          color="#EFDA5B"
          size="180px"
          duration="11s"
          delay="3s"
          bottom="30%"
          right="5%"
        />
        <section className="relative flex flex-col gap-4 items-center font-sans text-center py-30 overflow-hidden">
        {/* Contenu principal avec z-index pour être au-dessus des orbs */}
        <div className="relative z-10 flex flex-col gap-4 items-center">
        <h1 className="text-primary/90 max-w-3xl mx-auto text-center text-5xl font-semibold">
          Donnez vie à vos idées. Boostons l&#39;innovation open source en 
          <span className="text-[#007FFF]"> R</span>
          <span className="text-[#EFDA5B]">D</span>
          <span className="text-[#CA3E4B]">C</span>
        </h1>

        <p className="text-muted-foreground max-w-lg text-center font-sans">
          Découvrez, contribuez et partagez des projets open source locaux pour
          le développement technologique de la RDC.
        </p>

        <div className="flex gap-4 mt-8">
          <Link href="/explorer-les-projets" className="hover:shadow-md duration-300">
            <Button variant="outline">
              <span>Explorer les projets</span>
              <Telescope size="30" />
            </Button>
          </Link>

          <Link href="#" className="hover:shadow-md duration-300">
            <Button variant="rdc">
              <span>Soumettre un projet</span>
              <Send size="30" />
            </Button>
          </Link>
        </div>
        </div>
      </section>
    </div>
  );
}
