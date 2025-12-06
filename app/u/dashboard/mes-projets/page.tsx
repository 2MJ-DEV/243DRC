"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ExternalLink, Star, GitFork } from "lucide-react";
import Link from "next/link";
import { User } from "firebase/auth";

interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  technologies: string[];
  authorName: string;
  stars: number;
  forks: number;
  createdAt: string;
}

export default function MesProjetPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.push("/");
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadProjects = async (uid: string) => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "projects"),
        where("authorId", "==", uid),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      setProjects(projectsList);
    } catch (error: any) {
      if (error.code !== 'unavailable') {
        console.error("Erreur lors du chargement des projets:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      return;
    }

    if (!db) {
      alert("Impossible de supprimer le projet en mode hors ligne");
      return;
    }

    try {
      await deleteDoc(doc(db, "projects", projectId));
      setProjects(projects.filter(p => p.id !== projectId));
      alert("Projet supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du projet");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mes Projets</h1>
          <p className="text-muted-foreground">Gérez tous vos projets open source</p>
        </div>
        <Link href="/u/dashboard/ajouter-projet">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un projet
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Aucun projet</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par ajouter votre premier projet
                </p>
                <Link href="/u/dashboard/ajouter-projet">
                  <Button>Ajouter un projet</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(project.repoUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4" />
                    <span>{project.stars.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitFork className="w-4 h-4" />
                    <span>{project.forks.toLocaleString()}</span>
                  </div>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Ajouté le {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
