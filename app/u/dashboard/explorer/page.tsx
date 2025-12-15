"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, getDocs, orderBy, query, limit, startAfter, DocumentSnapshot } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, GitFork, ExternalLink, Search, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  technologies: string[];
  authorName: string;
  authorId: string;
  stars: number;
  forks: number;
  createdAt: string;
}

const PROJECTS_PER_PAGE = 20;

export default function ExplorerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Debouncer la recherche pour éviter trop de filtrages
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
      // Charger les projets une fois l'utilisateur authentifié
      loadAllProjects();
    });

    return () => unsubscribe();
  }, [router]);

  const loadAllProjects = useCallback(async (loadMore: boolean = false) => {
    if (!db) {
      setLoading(false);
      return;
    }

    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      let q = query(
        collection(db, "projects"),
        orderBy("createdAt", "desc"),
        limit(PROJECTS_PER_PAGE)
      );

      // Si on charge plus, commencer après le dernier document
      if (loadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty && !loadMore) {
        setProjects([]);
        setFilteredProjects([]);
        setHasMore(false);
      } else {
        const projectsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        if (loadMore) {
          setProjects(prev => [...prev, ...projectsList]);
          setFilteredProjects(prev => [...prev, ...projectsList]);
        } else {
          setProjects(projectsList);
          setFilteredProjects(projectsList);
        }

        // Mettre à jour le dernier document et vérifier s'il y a plus de données
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === PROJECTS_PER_PAGE);
        } else {
          setHasMore(false);
        }
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des projets:", error);
      
      // Gestion d'erreur améliorée
      if (error.code === 'failed-precondition') {
        setError("Index Firestore manquant. Veuillez créer l'index requis dans Firebase Console.");
      } else if (error.code === 'permission-denied') {
        setError("Permission refusée. Vérifiez vos règles Firestore.");
      } else if (error.code !== 'unavailable') {
        setError("Erreur lors du chargement des projets. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  // Filtrer les projets avec le terme de recherche debouncé
  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          ) ||
          project.authorName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [debouncedSearchTerm, projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Explorer les projets</h1>
        <p className="text-muted-foreground">Découvrez tous les projets open source de la communauté 243 DRC</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher par titre, description, technologie ou auteur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""} trouvé{filteredProjects.length > 1 ? "s" : ""}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {filteredProjects.length === 0 && !loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg mb-2">Aucun projet trouvé</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? "Essayez avec d'autres mots-clés"
                : "Aucun projet n'a encore été ajouté à la plateforme"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl flex-1">{project.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(project.repoUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{project.stars.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <GitFork className="w-4 h-4 text-blue-500" />
                        <span>{project.forks.toLocaleString()}</span>
                      </div>
                    </div>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {project.technologies.slice(0, 4).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 4 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                            +{project.technologies.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                      <User className="w-4 h-4" />
                      <span>{project.authorName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && !searchTerm && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => loadAllProjects(true)}
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Charger plus de projets"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
