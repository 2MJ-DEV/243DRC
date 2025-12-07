"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import projectsData from "@/data/projects.json";
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

interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  author: string;
  language: string;
  technologies: string[];
  githubStats?: {
    stars: number;
    forks: number;
    lastUpdated: string;
  };
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

  const githubInfo = getGithubInfo(project.link);
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
            <span className="flex items-center gap-1">
              <Users size={15} className="w-3 h-3 sm:w-4 sm:h-4" />
              {project.author}
            </span>
            <span className="flex items-center gap-1">
              <Code size={15} className="w-3 h-3 sm:w-4 sm:h-4" />
              {project.language}
            </span>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="border-t">
          <Button asChild variant="rdc" className="w-full">
            <a
              href={project.link}
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

  // Récupérer les projets depuis le fichier JSON
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Convertir les données JSON en format Project avec id en string
        const projectsList: Project[] = projectsData.map((project) => ({
          ...project,
          id: project.id.toString(),
          isLoadingStats: true,
        }));

        setProjects(projectsList);
        setFilteredProjects(projectsList);

        // Récupérer les stats GitHub pour chaque projet
        const projectsWithStats = await Promise.all(
          projectsList.map(async (project) => {
            const githubInfo = getGithubInfo(project.link);
            if (!githubInfo) {
              return { ...project, isLoadingStats: false };
            }

            try {
              const response = await fetch(
                `https://api.github.com/repos/${githubInfo.owner}/${githubInfo.repo}`
              );

              if (!response.ok) {
                return { ...project, isLoadingStats: false };
              }

              const data = await response.json();
              return {
                ...project,
                githubStats: {
                  stars: data.stargazers_count,
                  forks: data.forks_count,
                  lastUpdated: data.updated_at,
                },
                isLoadingStats: false,
              };
            } catch (error) {
              console.error(`Error fetching stats for ${project.name}:`, error);
              return { ...project, isLoadingStats: false };
            }
          })
        );

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

  // Fonction pour extraire owner et repo depuis le lien GitHub
  const getGithubInfo = (link: string) => {
    if (!link || typeof link !== 'string') return null;
    const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  };

  // Filtrer les projets par recherche et langage
  useEffect(() => {
    let filtered = projects;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
