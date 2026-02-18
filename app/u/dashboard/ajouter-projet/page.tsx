"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/components/ToastContainer";

export default function AjouterProjetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repoUrl: "",
    technologies: "",
    captures: "",
    authorName: "",
  });

  const parseCaptureUrls = (value: string) =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => /^https?:\/\//i.test(item));

  const fetchGithubStats = async (url: string) => {
    try {
      const { getCachedGitHubStats } = await import("@/lib/utils/githubCache");
      const stats = await getCachedGitHubStats(url);
      return stats || { stars: 0, forks: 0 };
    } catch (error) {
      console.error("Erreur lors de la recuperation des stats GitHub:", error);
      return { stars: 0, forks: 0 };
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const user = auth?.currentUser;
    if (!user) {
      showError("Connexion requise", "Vous devez etre connecte pour ajouter un projet");
      return;
    }

    if (!db) {
      showError("Mode hors ligne", "Impossible d'ajouter un projet en mode hors ligne");
      return;
    }

    if (!formData.title || !formData.description || !formData.repoUrl) {
      showError("Champs manquants", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);

      const docRef = await addDoc(collection(db, "projects"), {
        title: formData.title,
        description: formData.description,
        repoUrl: formData.repoUrl,
        technologies: formData.technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean),
        captures: parseCaptureUrls(formData.captures),
        authorName: formData.authorName || user.displayName,
        authorId: user.uid,
        authorEmail: user.email,
        stars: 0,
        forks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      showSuccess("Projet ajoute", "Votre projet a ete ajoute avec succes !");
      router.push("/u/dashboard/mes-projets");

      fetchGithubStats(formData.repoUrl)
        .then(({ stars, forks }) => {
          import("firebase/firestore").then(({ doc, updateDoc }) => {
            if (db) {
              updateDoc(doc(db, "projects", docRef.id), { stars, forks });
            }
          });
        })
        .catch((err) => {
          console.error("Erreur lors de la mise a jour des stats:", err);
        });
    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      showError("Erreur", "Une erreur est survenue lors de l'ajout du projet");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
            <CardDescription>
              Remplissez les informations de votre projet. Les statistiques GitHub seront recuperees automatiquement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du projet *</Label>
                <Input
                  id="title"
                  required
                  placeholder="Ex: 243 DRC Platform"
                  value={formData.title}
                  onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  required
                  placeholder="Decrivez votre projet en quelques mots..."
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="repoUrl">Lien du depot GitHub *</Label>
                <Input
                  id="repoUrl"
                  required
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={formData.repoUrl}
                  onChange={(event) => setFormData({ ...formData, repoUrl: event.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Les etoiles et forks seront recuperes automatiquement.
                </p>
              </div>

              <div>
                <Label htmlFor="technologies">Technologies utilisees</Label>
                <Input
                  id="technologies"
                  placeholder="Ex: React, Next.js, TypeScript, Firebase (separees par des virgules)"
                  value={formData.technologies}
                  onChange={(event) => setFormData({ ...formData, technologies: event.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="captures">Captures (URLs)</Label>
                <textarea
                  id="captures"
                  rows={4}
                  placeholder={"https://.../capture-1.png\nhttps://.../capture-2.jpg"}
                  value={formData.captures}
                  onChange={(event) => setFormData({ ...formData, captures: event.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Une URL par ligne (ou separees par virgules). Seules les URLs http/https sont conservees.
                </p>
              </div>

              <div>
                <Label htmlFor="authorName">Nom de l'auteur</Label>
                <Input
                  id="authorName"
                  placeholder={auth?.currentUser?.displayName || "Votre nom"}
                  value={formData.authorName}
                  onChange={(event) => setFormData({ ...formData, authorName: event.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide pour utiliser votre nom de profil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/u/dashboard">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button variant="rdc" type="submit" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter le projet"}
          </Button>
        </div>
      </form>
    </div>
  );
}

