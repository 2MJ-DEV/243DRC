"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/components/ToastContainer";

const fetchGithubStats = async (url: string) => {
  try {
    // Utiliser le cache GitHub pour éviter les limites de taux
    const { getCachedGitHubStats } = await import("@/lib/utils/githubCache");
    const stats = await getCachedGitHubStats(url);
    return stats || { stars: 0, forks: 0 };
  } catch (error) {
    console.error("Erreur lors de la récupération des stats GitHub:", error);
    return { stars: 0, forks: 0 };
  }
};

interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  technologies: string[];
  authorName: string;
  authorId: string;
}

export default function ModifierProjetPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repoUrl: "",
    technologies: "",
    authorName: "",
  });

  useEffect(() => {
    const loadProject = async () => {
      if (!auth?.currentUser || !db || !projectId) {
        router.push("/u/dashboard/mes-projets");
        return;
      }

      try {
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        
        if (!projectDoc.exists()) {
          showError("Projet introuvable", "Ce projet n'existe pas ou a été supprimé");
          router.push("/u/dashboard/mes-projets");
          return;
        }

        const data = projectDoc.data();
        
        // Vérifier que l'utilisateur est le propriétaire
        if (data.authorId !== auth.currentUser.uid) {
          showError("Permission refusée", "Vous n'êtes pas autorisé à modifier ce projet");
          router.push("/u/dashboard/mes-projets");
          return;
        }

        const projectData = {
          id: projectDoc.id,
          title: data.title || "",
          description: data.description || "",
          repoUrl: data.repoUrl || "",
          technologies: data.technologies || [],
          authorName: data.authorName || "",
          authorId: data.authorId || "",
        };

        setProject(projectData);
        setFormData({
          title: projectData.title,
          description: projectData.description,
          repoUrl: projectData.repoUrl,
          technologies: projectData.technologies.join(", "),
          authorName: projectData.authorName,
        });
      } catch (error) {
        console.error("Erreur lors du chargement du projet:", error);
        showError("Erreur", "Une erreur est survenue lors du chargement du projet");
        router.push("/u/dashboard/mes-projets");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth?.currentUser;
    if (!user) {
      showError("Connexion requise", "Vous devez être connecté pour modifier un projet");
      return;
    }

    if (!db || !project) {
      showError("Erreur", "Impossible de modifier le projet");
      return;
    }

    if (!formData.title || !formData.description || !formData.repoUrl) {
      showError("Champs manquants", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSaving(true);

      const repoUrlChanged = formData.repoUrl !== project.repoUrl;
      
      // Mettre à jour le projet dans Firestore
      await updateDoc(doc(db, "projects", projectId), {
        title: formData.title,
        description: formData.description,
        repoUrl: formData.repoUrl,
        technologies: formData.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        authorName: formData.authorName || user.displayName,
        updatedAt: new Date().toISOString(),
      });

      showSuccess("Projet modifié", "Votre projet a été modifié avec succès !");

      // Rediriger immédiatement
      router.push("/u/dashboard/mes-projets");

      // Si l'URL du repo a changé, mettre à jour les stats GitHub en arrière-plan
      if (repoUrlChanged) {
        fetchGithubStats(formData.repoUrl)
          .then(({ stars, forks }) => {
            // Mettre à jour le document avec les nouvelles stats
            if (db) {
              updateDoc(doc(db, "projects", projectId), { stars, forks });
            }
          })
          .catch((err) => {
            console.error("Erreur lors de la mise à jour des stats:", err);
          });
      }
    } catch (error: any) {
      console.error("Erreur lors de la modification du projet:", error);
      
      if (error.code === 'permission-denied') {
        showError("Permission refusée", "Vous n'êtes pas autorisé à modifier ce projet");
      } else {
        showError("Erreur", "Une erreur est survenue lors de la modification du projet");
      }
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Modifier le projet</CardTitle>
            <CardDescription>
              Modifiez les informations de votre projet. Les statistiques GitHub seront mises à jour automatiquement.
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du projet *</Label>
                <Input
                  id="title"
                  required
                  placeholder="Ex: 243 DRC Platform"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  required
                  placeholder="Décrivez votre projet en quelques mots..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, repoUrl: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Les étoiles et forks seront mis à jour automatiquement
                </p>
              </div>

              <div>
                <Label htmlFor="technologies">Technologies utilisées</Label>
                <Input
                  id="technologies"
                  placeholder="Ex: React, Next.js, TypeScript, Firebase (séparées par des virgules)"
                  value={formData.technologies}
                  onChange={(e) =>
                    setFormData({ ...formData, technologies: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="authorName">Nom de l&#39;auteur</Label>
                <Input
                  id="authorName"
                  placeholder={auth?.currentUser?.displayName || "Votre nom"}
                  value={formData.authorName}
                  onChange={(e) =>
                    setFormData({ ...formData, authorName: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Laissez vide pour utiliser votre nom de profil
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/u/dashboard/mes-projets">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
          <Button variant="rdc" type="submit" disabled={saving}>
            {saving ? "Modification en cours..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </div>
  );
}

