import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 pt-40">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#007FFF]/20 blur-3xl" />
        <div className="absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-[#EFDA5B]/20 blur-3xl" />
        <div className="absolute bottom-8 left-1/3 h-72 w-72 rounded-full bg-[#CA3E4B]/20 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl border bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl dark:bg-black/20 sm:p-12">
        <p className="text-sm font-semibold tracking-[0.25em] text-[#007FFF]">ERREUR 404</p>
        <h1 className="mt-4 text-4xl font-semibold text-primary sm:text-5xl">
          Page introuvable
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Cette ressource n&apos;existe pas ou a ete deplacee. Revenez a l&apos;accueil
          ou continuez l&apos;exploration des projets open source.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="rdc">
            <Link href="/">
              <Home />
              Retour a l&apos;accueil
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/explorer-les-projets">
              <Compass />
              Explorer les projets
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
