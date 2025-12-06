"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AjouterProjetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repoUrl: "",
    technologies: "",
    authorName: "",
  });

  const fetchGithubStats = async (url: string) => {
    try {
      // Extraire owner/repo du lien GitHub
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return { stars: 0, forks: 0 };

      const [, owner, repo] = match;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      
      if (!response.ok) return { stars: 0, forks: 0 };

      const data = await response.json();
      return {
        stars: data.stargazers_count || 0,
        forks: data.forks_count || 0,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des stats GitHub:", error);
      return { stars: 0, forks: 0 };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = auth?.currentUser;
    if (!user) {
      alert("Vous devez être connecté pour ajouter un projet");
      return;
    }

    if (!db) {
      alert("Impossible d'ajouter un projet en mode hors ligne");
      return;
    }

    if (!formData.title || !formData.description || !formData.repoUrl) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);

      // Ajouter le projet à Firestore IMMÉDIATEMENT avec des stats temporaires
      const docRef = await addDoc(collection(db, "projects"), {
        title: formData.title,
        description: formData.description,
        repoUrl: formData.repoUrl,
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
        authorName: formData.authorName || user.displayName,
        authorId: user.uid,
        authorEmail: user.email,
        stars: 0,
        forks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Rediriger immédiatement
      router.push("/u/dashboard/mes-projets");

      // Récupérer les stats GitHub EN ARRIÈRE-PLAN après la redirection
      fetchGithubStats(formData.repoUrl).then(({ stars, forks }) => {
        // Mettre à jour le document avec les vraies stats
        import("firebase/firestore").then(({ doc, updateDoc }) => {
          if (db) {
            updateDoc(doc(db!, "projects", docRef.id), { stars, forks });
          }
        });
      }).catch(err => {
        console.error("Erreur lors de la mise à jour des stats:", err);
      });

    } catch (error) {
      console.error("Erreur lors de l'ajout du projet:", error);
      alert("Erreur lors de l'ajout du projet");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/u/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ajouter un projet</h1>
          <p className="text-muted-foreground">Partagez votre projet avec la communauté</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
            <CardDescription>
              Remplissez les informations de votre projet. Les statistiques GitHub seront récupérées automatiquement.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titre du projet *</Label>
              <Input
                id="title"
                required
                placeholder="Ex: 243 DRC Platform"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                required
                placeholder="Décrivez votre projet en quelques mots..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="repoUrl">Lien du dépôt GitHub *</Label>
              <Input
                id="repoUrl"
                required
                type="url"
                placeholder="https://github.com/username/repo"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Les étoiles et forks seront récupérés automatiquement
              </p>
            </div>

            <div>
              <Label htmlFor="technologies">Technologies utilisées</Label>
              <Input
                id="technologies"
                placeholder="Ex: React, Next.js, TypeScript, Firebase (séparées par des virgules)"
                value={formData.technologies}
                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="authorName">Nom de l&#39;auteur</Label>
              <Input
                id="authorName"
                placeholder={auth?.currentUser?.displayName || "Votre nom"}
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Laissez vide pour utiliser votre nom de profil
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/u/dashboard">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter le projet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
