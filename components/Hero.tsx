import { Button } from "./ui/button";
import Link from "next/link";
import Preview from "./ui/Preview";

export default function Hero() {
  return (
    <>
      <section className="flex flex-col gap-4 items-center font-sans text-center py-30">
        <h1 className="text-primary/80 w-[50vw] mx-auto text-center text-5xl font-semibold">
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
          <Link href="#" className="hover:shadow-md duration-300">
            <Button variant="outline">
              {/* <ShieldCheck color="#fff" /> */}
              <span>Explorer les projets</span>
            </Button>
          </Link>

          <Link href="#" className="hover:shadow-md duration-300">
            <Button variant="rdc">
              {/* <ShieldCheck color="#fff" /> */}
              <span>Soumettre un projet</span>
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-30">
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Fenêtre macOS */}
          <div className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-[#f5f5f7] dark:bg-[#1a1a1c] shadow-md">
            {/* Barre du haut (style macOS) */}
            <div className="flex items-center gap-2 px-4 py-2 bg-[#e8e8ed] dark:bg-[#2a2a2c] border-b border-black/10 dark:border-white/10">
              <span className="w-3 h-3 rounded-full bg-[#007FFF]"></span>
              <span className="w-3 h-3 rounded-full bg-[#EFDA5B]"></span>
              <span className="w-3 h-3 rounded-full bg-[#CA3E4B]"></span>
            </div>

            <Preview />
          </div>
        </div>
      </section>
    </>
  );
}
