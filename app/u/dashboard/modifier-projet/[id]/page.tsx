"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/components/ToastContainer";

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

interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  technologies: string[];
  captures?: string[];
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
    captures: "",
    authorName: "",
  });

  const parseCaptureUrls = (value: string) =>
    value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => /^https?:\/\//i.test(item));

  useEffect(() => {
    const loadProject = async () => {
      if (!auth?.currentUser || !db || !projectId) {
        router.push("/u/dashboard/mes-projets");
        return;
      }

      try {
        const projectDoc = await getDoc(doc(db, "projects", projectId));
        if (!projectDoc.exists()) {
          showError("Projet introuvable", "Ce projet n'existe pas ou a ete supprime");
          router.push("/u/dashboard/mes-projets");
          return;
        }

        const data = projectDoc.data();
        if (data.authorId !== auth.currentUser.uid) {
          showError("Permission refusee", "Vous n'etes pas autorise a modifier ce projet");
          router.push("/u/dashboard/mes-projets");
          return;
        }

        const projectData: Project = {
          id: projectDoc.id,
          title: data.title || "",
          description: data.description || "",
          repoUrl: data.repoUrl || "",
          technologies: data.technologies || [],
          captures: Array.isArray(data.captures) ? data.captures : [],
          authorName: data.authorName || "",
          authorId: data.authorId || "",
        };

        setProject(projectData);
        setFormData({
          title: projectData.title,
          description: projectData.description,
          repoUrl: projectData.repoUrl,
          technologies: projectData.technologies.join(", "),
          captures: (projectData.captures || []).join("\n"),
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

    void loadProject();
  }, [projectId, router, showError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const user = auth?.currentUser;
    if (!user) {
      showError("Connexion requise", "Vous devez etre connecte pour modifier un projet");
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

      await updateDoc(doc(db, "projects", projectId), {
        title: formData.title,
        description: formData.description,
        repoUrl: formData.repoUrl,
        technologies: formData.technologies
          .split(",")
          .map((tech) => tech.trim())
          .filter(Boolean),
        captures: parseCaptureUrls(formData.captures),
        authorName: formData.authorName || user.displayName,
        updatedAt: new Date().toISOString(),
      });

      showSuccess("Projet modifie", "Votre projet a ete modifie avec succes !");
      router.push("/u/dashboard/mes-projets");

      if (repoUrlChanged) {
        fetchGithubStats(formData.repoUrl)
          .then(({ stars, forks }) => {
            if (db) {
              updateDoc(doc(db, "projects", projectId), { stars, forks });
            }
          })
          .catch((err) => {
            console.error("Erreur lors de la mise a jour des stats:", err);
          });
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la modification du projet:", error);
      const firestoreError = error as { code?: string };
      if (firestoreError.code === "permission-denied") {
        showError("Permission refusee", "Vous n'etes pas autorise a modifier ce projet");
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

  if (!project) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Modifier le projet</CardTitle>
            <CardDescription>
              Modifiez les informations de votre projet. Les statistiques GitHub seront mises a jour automatiquement.
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
                  Les etoiles et forks seront mis a jour automatiquement.
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

