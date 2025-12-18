"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, ExternalLink, Star, GitFork, Loader } from "lucide-react";
import Link from "next/link";
import { User } from "firebase/auth";
import { ProjectActions } from "@/components/ProjectActions";
import Image from "next/image";

interface Project {
  id: string;
  title: string;
  name?: string;
  description: string;
  repoUrl: string;
  technologies: string[];
  authorName: string;
  stars: number;
  forks: number;
  createdAt: string;
}

export default function FavorisPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.push("/");
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      loadFavorites(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadFavorites = async (userId: string) => {
    if (!db) {
      setLoading(false);
      return;
    }

    const firestoreDb = db; // Stocker db dans une constante locale pour TypeScript

    try {
      // Récupérer tous les favoris de l'utilisateur
      const favoritesQuery = query(
        collection(firestoreDb, "favorites"),
        where("userId", "==", userId)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);
      
      const projectIds = favoritesSnapshot.docs.map((doc) => doc.data().projectId);
      
      if (projectIds.length === 0) {
        setProjects([]);
        setLoading(false);
        return;
      }

      // Récupérer les projets correspondants
      const projectPromises = projectIds.map(async (projectId) => {
        try {
          const projectDoc = await getDoc(doc(firestoreDb, "projects", projectId));
          if (projectDoc.exists()) {
            return {
              id: projectDoc.id,
              ...projectDoc.data(),
            } as Project;
          }
          return null;
        } catch (error) {
          console.error(`Erreur lors du chargement du projet ${projectId}:`, error);
          return null;
        }
      });

      const loadedProjects = (await Promise.all(projectPromises)).filter(
        (p) => p !== null
      ) as Project[];

      // Trier par date de création (plus récent en premier)
      loadedProjects.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setProjects(loadedProjects);
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  };

  const getGithubInfo = (link: string) => {
    const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes favoris</h1>
          <p className="text-muted-foreground mt-2">
            {projects.length === 0
              ? "Aucun projet en favoris"
              : `${projects.length} projet${projects.length > 1 ? "s" : ""} sauvegardé${projects.length > 1 ? "s" : ""}`
            }
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col text-center">
            <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-xl mb-2">Aucun favori</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore ajouté de projets à vos favoris.
            </p>
            <Link href="/u/dashboard/explorer">
              <Button variant="rdc">Explorer les projets</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const githubInfo = getGithubInfo(project.repoUrl);
            const imageUrl = githubInfo
              ? `https://opengraph.githubassets.com/1/${githubInfo.owner}/${githubInfo.repo}`
              : null;
            const displayedTechnologies = project.technologies?.slice(0, 4) || [];

            return (
              <Card key={project.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
                {imageUrl && (
                  <div className="p-2">
                    <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={project.title || project.name || "Project"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg font-bold text-primary line-clamp-2">
                      {project.title || project.name}
                    </CardTitle>
                    <div className="flex gap-2 text-sm whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {formatNumber(project.stars || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        {formatNumber(project.forks || 0)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {project.description}
                  </p>

                  {displayedTechnologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {displayedTechnologies.map((tech: string, i: number) => (
                        <span
                          key={i}
                          className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto space-y-3">
                    <div className="flex justify-end">
                      <ProjectActions projectId={project.id} compact />
                    </div>
                    <Link
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                    >
                      Voir le projet
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

