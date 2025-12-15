"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/lib/firebaseClient";
import { collection, getDocs, orderBy, query, limit, startAfter, DocumentSnapshot } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, GitFork, ExternalLink, Search, User, Loader2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { ProjectActions } from "@/components/ProjectActions";
import Link from "next/link";

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

  // Fonction pour extraire owner et repo depuis le lien GitHub
  const getGithubInfo = (link: string) => {
    if (!link || typeof link !== 'string') return null;
    const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  };

  // Fonction pour formater les nombres (1000 -> 1k)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const githubInfo = getGithubInfo(project.repoUrl);
              const imageUrl = githubInfo
                ? `https://opengraph.githubassets.com/1/${githubInfo.owner}/${githubInfo.repo}`
                : null;
              const displayedTechnologies = project.technologies?.slice(0, 4) || [];
              const remainingCount = (project.technologies?.length || 0) - 4;

              return (
                <Card key={project.id} className="flex flex-col h-full hover:shadow-xl transition-all duration-300 overflow-hidden group max-h-[600px]">
                  {/* IMAGE GITHUB avec padding interne - Fixée en haut */}
                  {imageUrl && (
                    <div className="relative w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                      />
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-bold text-primary line-clamp-2 flex-1">
                        {project.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-6 w-6"
                        onClick={() => window.open(project.repoUrl, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* STATS */}
                    <div className="flex gap-3 text-muted-foreground text-xs mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>{formatNumber(project.stars || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-blue-500" />
                        <span>{formatNumber(project.forks || 0)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col pb-3">
                    <CardDescription className="line-clamp-2 mb-3 text-xs">
                      {project.description}
                    </CardDescription>

                    {/* TECHNOLOGIES */}
                    {displayedTechnologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {displayedTechnologies.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-[#EFDA5B]/20 text-foreground px-2 py-0.5 rounded text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {remainingCount > 0 && (
                          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs font-medium">
                            +{remainingCount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* INFOS AUTEUR */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2 border-t">
                      <Link
                        href={`/profil/${project.authorId || 'unknown'}`}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={(e) => {
                          if (!project.authorId) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <User className="w-3 h-3" />
                        <span className="hover:underline truncate max-w-[120px]">{project.authorName}</span>
                      </Link>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          <span className="truncate max-w-[80px]">{project.technologies[0]}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* FOOTER */}
                  <div className="px-6 pb-3 pt-0 border-t space-y-2">
                    <Button asChild variant="rdc" className="w-full h-9 text-sm">
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center items-center gap-2"
                      >
                        Voir le projet
                      </a>
                    </Button>
                    <div className="w-full flex justify-end">
                      <ProjectActions projectId={project.id} compact />
                    </div>
                  </div>
                </Card>
              );
            })}
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
