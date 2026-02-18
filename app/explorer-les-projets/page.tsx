"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter,
  DocumentSnapshot,
} from "firebase/firestore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, GitFork, Loader, Star, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ProjectActions } from "@/components/ProjectActions";
import { ProjectComments } from "@/components/ProjectComments";

interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  repoUrl?: string;
  author: string;
  authorName?: string;
  authorId?: string;
  language: string;
  technologies: string[];
  githubStats?: {
    stars: number;
    forks: number;
    lastUpdated: string;
  };
  stars?: number;
  forks?: number;
  isLoadingStats?: boolean;
}

function ProjectCard({ project }: { project: Project }) {
  const stats = project.githubStats;
  const loading = project.isLoadingStats || false;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return String(num);
  };

  const displayedTechnologies = project.technologies.slice(0, 4);
  const remainingCount = project.technologies.length - 4;

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

        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl font-bold text-[#007FFF] line-clamp-2">
              {project.name}
            </CardTitle>

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

        <CardContent className="flex-1 flex flex-col">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-3">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 my-4">
            {displayedTechnologies.map((tech, i) => (
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

          <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-auto">
            <Link
              href={`/profil/${project.authorId || "unknown"}`}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
              onClick={(event) => {
                if (!project.authorId) event.preventDefault();
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

        <CardFooter className="flex flex-col gap-3 border-t">
          <Button asChild variant="rdc" className="w-full">
            <Link href={`/projets/${project.id}`} className="flex justify-center items-center gap-2">
              Voir le projet
            </Link>
          </Button>
          <div className="w-full space-y-2">
            <div className="flex justify-end">
              <ProjectActions projectId={project.id} compact />
            </div>
            <ProjectComments
              projectId={project.id}
              projectTitle={project.name}
              projectAuthorId={project.authorId}
            />
          </div>
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

  const getGithubInfo = (link: string) => {
    if (!link || typeof link !== "string") return null;
    const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!db) {
          setProjects([]);
          setFilteredProjects([]);
          return;
        }

        const allProjects: Project[] = [];
        let lastDoc: DocumentSnapshot | null = null;
        let hasMore = true;

        while (hasMore) {
          let q = query(
            collection(db, "projects"),
            orderBy("createdAt", "desc"),
            limit(100)
          );

          if (lastDoc) q = query(q, startAfter(lastDoc));

          const snapshot = await getDocs(q);
          if (snapshot.empty) {
            hasMore = false;
            break;
          }

          const firestoreProjects: Project[] = snapshot.docs.map((projectDoc) => {
            const data = projectDoc.data();
            return {
              id: projectDoc.id,
              name: data.title || "",
              description: data.description || "",
              link: data.repoUrl || "",
              repoUrl: data.repoUrl || "",
              author: data.authorName || "Auteur inconnu",
              authorName: data.authorName || "Auteur inconnu",
              authorId: data.authorId || "",
              language: data.technologies?.[0] || "Autre",
              technologies: data.technologies || [],
              stars: data.stars || 0,
              forks: data.forks || 0,
              isLoadingStats: true,
            };
          });

          allProjects.push(...firestoreProjects);

          if (snapshot.docs.length < 100) {
            hasMore = false;
          } else {
            lastDoc = snapshot.docs[snapshot.docs.length - 1];
          }
        }

        setProjects(allProjects);
        setFilteredProjects(allProjects);

        const { getCachedGitHubStatsBatch } = await import("@/lib/utils/githubCache");
        const repoUrls = allProjects
          .map((project) => project.link || project.repoUrl || "")
          .filter((link) => link && getGithubInfo(link) !== null);

        const statsMap = await getCachedGitHubStatsBatch(repoUrls, 5);

        const projectsWithStats = allProjects.map((project) => {
          const repoLink = project.link || project.repoUrl || "";
          const stats = statsMap.get(repoLink);
          const finalStars = project.stars ?? stats?.stars ?? 0;
          const finalForks = project.forks ?? stats?.forks ?? 0;

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
        });

        setProjects(projectsWithStats);
        setFilteredProjects(projectsWithStats);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      const loweredSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(loweredSearch) ||
          project.description.toLowerCase().includes(loweredSearch) ||
          (project.author || project.authorName || "").toLowerCase().includes(loweredSearch) ||
          project.technologies.some((tech) => tech.toLowerCase().includes(loweredSearch))
      );
    }

    if (selectedLanguage !== "all") {
      filtered = filtered.filter((project) => project.language === selectedLanguage);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedLanguage, projects]);

  const languages = ["all", ...new Set(projects.map((project) => project.language))];

  return (
    <div className="min-h-screen w-[95vw] mx-auto bg-background pt-24 md:pt-28">
      <section className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Explorer les Projets
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Decouvrez tous les projets open source publies par la communaute.
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, description, auteur ou technologie..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#007FFF]"
          >
            <option value="all">Tous les langages</option>
            {languages.slice(1).map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6 text-sm text-muted-foreground">
          {loading ? (
            <span>Chargement des projets...</span>
          ) : (
            <span>
              {filteredProjects.length} projet{filteredProjects.length !== 1 ? "s" : ""} trouve
              {filteredProjects.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader className="w-8 h-8 animate-spin text-[#007FFF]" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">
              Aucun projet trouve. Essayez de modifier vos criteres de recherche.
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

