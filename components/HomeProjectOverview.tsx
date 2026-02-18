import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Compass, Handshake, Rocket } from "lucide-react";

const steps = [
  {
    icon: Compass,
    title: "Decouvrir",
    description:
      "Explorez des projets utiles a la communaute tech de la RDC, avec des stacks et besoins reels.",
  },
  {
    icon: Handshake,
    title: "Collaborer",
    description:
      "Connectez-vous avec d'autres developpeurs, partagez des retours et avancez ensemble.",
  },
  {
    icon: Code2,
    title: "Contribuer",
    description:
      "Proposez du code, des idees, de la documentation et des ameliorations produit.",
  },
  {
    icon: Rocket,
    title: "Lancer",
    description:
      "Transformez un prototype local en projet visible, maintenu et utile pour l'ecosysteme.",
  },
];

export default function HomeProjectOverview() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="rounded-3xl border bg-background/90 p-6 sm:p-10">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wide text-[#007FFF] font-semibold">
            A Propos Du Projet
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold">
            243 DRC est une plateforme communautaire open source
          </h2>
          <p className="mt-4 text-muted-foreground">
            Le projet a pour but de rendre la collaboration technique plus simple en RDC:
            visibilite des initiatives locales, contributions ouvertes et mise en relation
            rapide entre profils techniques.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((item) => (
            <Card key={item.title} className="border bg-background">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <item.icon className="w-5 h-5 text-[#007FFF]" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="rdc">
            <Link href="/explorer-les-projets">Voir les projets</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/u/dashboard/ajouter-projet">Publier un projet</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

