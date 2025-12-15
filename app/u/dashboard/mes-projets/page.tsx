"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ExternalLink, Star, GitFork, Edit } from "lucide-react";
import Link from "next/link";
import { User } from "firebase/auth";
import { useToast } from "@/components/ToastContainer";
import { ConfirmModal } from "@/components/ui/modal";

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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const router = useRouter();
  const { showError, showSuccess } = useToast();

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
      setCurrentUser(user);
      // Charger les projets une fois l'utilisateur authentifié
      loadProjects(user.uid);
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
        // Note: Cette requête nécessite un index composite dans Firestore
        // Collection: projects, Fields: authorId (Ascending) + createdAt (Descending)
      );
      
      const snapshot = await getDocs(q);
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      setProjects(projectsList);
    } catch (error: any) {
      console.error("Erreur lors du chargement des projets:", error);
      
      // Gestion d'erreur améliorée
      if (error.code === 'failed-precondition') {
        showError(
          "Index Firestore manquant",
          "Veuillez créer l'index composite requis : Collection: projects, Champs: authorId (Ascending) + createdAt (Descending)"
        );
      } else if (error.code === 'permission-denied') {
        showError("Permission refusée", "Vérifiez vos règles Firestore dans Firebase Console");
      } else if (error.code !== 'unavailable') {
        showError("Erreur", "Une erreur est survenue lors du chargement des projets");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete || !db) {
      if (!db) {
        showError("Mode hors ligne", "Impossible de supprimer le projet en mode hors ligne");
      }
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      return;
    }

    try {
      await deleteDoc(doc(db, "projects", projectToDelete));
      setProjects(projects.filter(p => p.id !== projectToDelete));
      showSuccess("Projet supprimé", "Le projet a été supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showError("Erreur", "Une erreur est survenue lors de la suppression du projet");
    } finally {
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
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
                      title="Ouvrir le dépôt GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Link href={`/u/dashboard/modifier-projet/${project.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Modifier le projet"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(project.id)}
                      title="Supprimer le projet"
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

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le projet"
        message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="destructive"
      />
    </div>
  );
}
