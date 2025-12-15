"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import projectsData from "@/data/projects.json";
import { auth, db } from "@/lib/firebaseClient";
import { collection, getDocs, orderBy, query, limit, startAfter, DocumentSnapshot } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code, GitFork, Loader, Star, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  title?: string; // Pour les projets Firestore
  description: string;
  link: string;
  repoUrl?: string; // Pour les projets Firestore
  author: string;
  authorName?: string; // Pour les projets Firestore
  authorId?: string; // ID de l'auteur pour les projets Firestore
  language: string;
  technologies: string[];
  githubStats?: {
    stars: number;
    forks: number;
    lastUpdated: string;
  };
  stars?: number; // Pour les projets Firestore
  forks?: number; // Pour les projets Firestore
  isLoadingStats?: boolean;
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const stats = project.githubStats;
  const loading = project.isLoadingStats || false;

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

  // Limiter à 4 technologies maximum
  const displayedTechnologies = project.technologies.slice(0, 4);
  const remainingCount = project.technologies.length - 4;

  // Extraire owner et repo depuis le lien GitHub
  const getGithubInfo = (link: string) => {
    const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  };

  const repoLink = project.link || project.repoUrl || "";
  const githubInfo = getGithubInfo(repoLink);
  const imageUrl = githubInfo
    ? `https://opengraph.githubassets.com/1/${githubInfo.owner}/${githubInfo.repo}`
    : null;

  return (
    <div className="relative h-full">
      <Card className="flex flex-col h-full transition-shadow duration-300 overflow-hidden hover:shadow-lg">
        {/* IMAGE GITHUB avec padding interne */}
        {imageUrl && (
          <div className="p-2">
            <div className="relative hover:border border-[#007FFF] w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={imageUrl}
                alt={project.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        )}

        {/* HEADER */}
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl font-bold text-[#007FFF] line-clamp-2">
              {project.name}
            </CardTitle>

            {/* STATS */}
            <div className="flex gap-2 sm:gap-4 text-gray-600 text-xs sm:text-sm whitespace-nowrap">
              {loading ? (
                <div className="flex items-center gap-1">
                  <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-[#007FFF]" />
                </div>
              ) : stats ? (
                <>
                  <span className="flex items-center gap-1">
                    <Star size={15} className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formatNumber(stats.stars)}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork size={15} className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formatNumber(stats.forks)}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-3">
            {project.description}
          </p>

          {/* TECHNOLOGIES - Max 4 */}
          <div className="flex flex-wrap gap-2 my-4">
            {displayedTechnologies.map((tech: string, i: number) => (
              <span
                key={i}
                className="bg-[#EFDA5B]/20 text-black dark:text-white px-2 py-1 rounded text-xs font-medium"
              >
                {tech}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-medium">
                +{remainingCount}
              </span>
            )}
          </div>

          {/* INFOS */}
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-auto">
            <Link 
              href={`/profil/${project.authorId || 'unknown'}`}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
              onClick={(e) => {
                if (!project.authorId) {
                  e.preventDefault();
                }
              }}
            >
              <Users size={15} className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hover:underline">
                {project.author || project.authorName || "Auteur inconnu"}
              </span>
            </Link>
            <span className="flex items-center gap-1">
              <Code size={15} className="w-3 h-3 sm:w-4 sm:h-4" />
              {project.language || "Autre"}
            </span>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="border-t">
          <Button asChild variant="rdc" className="w-full">
            <a
              href={project.link || project.repoUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-center items-center gap-2"
            >
              Voir le projet
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function ExplorerLesProjets() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");

  // Fonction pour extraire owner et repo depuis le lien GitHub
  const getGithubInfo = (link: string) => {
    if (!link || typeof link !== 'string') return null;
    const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  };

  // Récupérer les projets depuis Firestore ET le fichier JSON
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const allProjects: Project[] = [];

        // 1. Charger les projets depuis le fichier JSON (projets statiques)
        const jsonProjects: Project[] = projectsData.map((project) => ({
          ...project,
          id: project.id.toString(),
          isLoadingStats: true,
        }));
        allProjects.push(...jsonProjects);

        // 2. Charger TOUS les projets depuis Firestore (projets ajoutés par les utilisateurs)
        if (db) {
          try {
            // Charger tous les projets avec pagination
            let lastDoc: DocumentSnapshot | null = null;
            let hasMore = true;
            const allFirestoreProjects: Project[] = [];

            while (hasMore) {
              let q = query(
                collection(db, "projects"),
                orderBy("createdAt", "desc"),
                limit(100) // Charger par batch de 100
              );

              if (lastDoc) {
                q = query(q, startAfter(lastDoc));
              }

              const snapshot = await getDocs(q);
              
              if (snapshot.empty) {
                hasMore = false;
                break;
              }

              const firestoreProjects: Project[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  name: data.title || "",
                  title: data.title,
                  description: data.description || "",
                  link: data.repoUrl || "",
                  repoUrl: data.repoUrl,
                  author: data.authorName || "Auteur inconnu",
                  authorName: data.authorName,
                  authorId: data.authorId || "", // Ajouter l'ID de l'auteur
                  language: data.technologies?.[0] || "Autre", // Utiliser la première technologie comme langage
                  technologies: data.technologies || [],
                  stars: data.stars || 0,
                  forks: data.forks || 0,
                  isLoadingStats: true,
                };
              });

              allFirestoreProjects.push(...firestoreProjects);
              
              // Si on a moins de 100 résultats, c'est la dernière page
              if (snapshot.docs.length < 100) {
                hasMore = false;
              } else {
                lastDoc = snapshot.docs[snapshot.docs.length - 1];
              }
            }
            
            allProjects.push(...allFirestoreProjects);
            console.log(`Chargé ${allFirestoreProjects.length} projets depuis Firestore`);
          } catch (firestoreError: any) {
            console.error("Erreur lors du chargement des projets Firestore:", firestoreError);
            
            // Si l'erreur est due à l'authentification, on continue avec les projets JSON
            if (firestoreError.code === 'permission-denied') {
              console.warn("Permission refusée pour lire Firestore. Affichage des projets JSON uniquement.");
            }
            // Continuer même si Firestore échoue, on aura au moins les projets JSON
          }
        }

        setProjects(allProjects);
        setFilteredProjects(allProjects);

        // 3. Récupérer les stats GitHub pour chaque projet avec cache et batch
        const { getCachedGitHubStatsBatch } = await import("@/lib/utils/githubCache");
        const repoUrls = allProjects
          .map(p => p.link || p.repoUrl || "")
          .filter(link => link && getGithubInfo(link) !== null);
        
        const statsMap = await getCachedGitHubStatsBatch(repoUrls, 5);
        
        const projectsWithStats = allProjects.map((project) => {
          const repoLink = project.link || project.repoUrl || "";
          const stats = statsMap.get(repoLink);
          
          // Utiliser les stats Firestore si disponibles, sinon utiliser les stats GitHub
          const finalStars = project.stars !== undefined ? project.stars : (stats?.stars || 0);
          const finalForks = project.forks !== undefined ? project.forks : (stats?.forks || 0);
          
          if (stats || project.stars !== undefined) {
            return {
              ...project,
              githubStats: {
                stars: finalStars,
                forks: finalForks,
                lastUpdated: new Date().toISOString(),
              },
              stars: finalStars,
              forks: finalForks,
              isLoadingStats: false,
            };
          }
          return { ...project, isLoadingStats: false };
        });

        setProjects(projectsWithStats);
        setFilteredProjects(projectsWithStats);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filtrer les projets par recherche et langage
  useEffect(() => {
    let filtered = projects;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          (project.name || project.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.author || project.authorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filtrer par langage
    if (selectedLanguage !== "all") {
      filtered = filtered.filter(
        (project) => project.language === selectedLanguage
      );
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedLanguage, projects]);

  // Obtenir la liste unique des langages
  const languages = ["all", ...new Set(projects.map((p) => p.language))];

  return (
    <div className="min-h-screen w-[95vw] mx-auto bg-background pt-24 md:pt-28">
      <section className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explorer les Projets
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez tous les projets open source développés par la communauté
            congolaise
          </p>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, description, auteur ou technologie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre par langage */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#007FFF]"
          >
            <option value="all">Tous les langages</option>
            {languages.slice(1).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Compteur de résultats */}
        <div className="mb-6 text-sm text-muted-foreground">
          {loading ? (
            <span>Chargement des projets...</span>
          ) : (
            <span>
              {filteredProjects.length} projet{filteredProjects.length !== 1 ? "s" : ""} trouvé
              {filteredProjects.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Grille de projets */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 animate-spin text-[#007FFF]" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              Aucun projet trouvé. Essayez de modifier vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
