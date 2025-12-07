"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { projectsData, ProjectWithStats } from "../data/projects";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Code, GitFork, Loader, Star, Users } from "lucide-react";
import { Button } from "./ui/button";

interface ProjectCardProps {
  project: ProjectWithStats;
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
      <Card
        className="flex flex-col h-full transition-shadow duration-300 overflow-hidden"
      >
        {/* IMAGE GITHUB avec padding interne */}
        {imageUrl && (
          <div className="p-2">
            <div className="relative hover:border border-[#007FFF] w-full h-48 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-sm">
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-[#007FFF] line-clamp-2">
              {project.name}
            </CardTitle>

            {/* STATS */}
            <div className="flex gap-4 text-gray-600 text-sm whitespace-nowrap">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 text-[#007FFF]" />
                  <span>Loading...</span>
                </div>
              ) : stats ? (
                <>
                  <span className="flex items-center gap-1"><Star size={15} /> {formatNumber(stats.stars)}</span>
                  <span className="flex items-center gap-1"><GitFork size={15} /> {formatNumber(stats.forks)}</span>
                </>
              ) : (
                <span className="text-xs">No stats</span>
              )}
            </div>
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="flex-1 flex flex-col">
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
            {project.description}
          </p>

          {/* TECHNOLOGIES - Max 4 */}
          <div className="flex flex-wrap gap-2 my-4">
            {displayedTechnologies.map((tech: string, i: number) => (
              <span
                key={i}
                className="bg-[#EFDA5B]/20 text-black px-2 py-1 rounded text-xs font-medium"
              >
                {tech}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                +{remainingCount}
              </span>
            )}
          </div>

          {/* INFOS */}
          <div className="flex justify-between text-sm text-gray-600 mt-auto">
            <span className="flex items-center gap-1"><Users size={15} /> {project.author}</span>
            <span className="flex items-center gap-1"><Code size={15} /> {project.language}</span>
          </div>
        </CardContent>

        {/* FOOTER */}
        <CardFooter className="border-t">
          <Button
            asChild
            variant="rdc"
            className="w-full"
          >
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

export default function FeaturedProject() {
  // Prendre les 3 premiers projets
  const [projects, setProjects] = useState<ProjectWithStats[]>(
    projectsData.slice(0, 3).map((p) => ({ ...p, isLoadingStats: true }))
  );

  useEffect(() => {
    // Fonction pour extraire owner et repo depuis le lien GitHub
    const getGithubInfo = (link: string) => {
      const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
      }
      return null;
    };

    // Fonction pour récupérer les stats GitHub
    const fetchGithubStats= async (project: ProjectWithStats) => {
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
    };

    // Récupérer les stats pour tous les projets
    Promise.all(projects.map(fetchGithubStats)).then(setProjects);
  }, []);

  return (
    <section className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Projets Open Source en Vedette
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Les projets les plus populaires et impactants développés par la
            communauté RDC.
          </p>
        </div>

        {/* Grille de 3 cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 skewbox p-4 border">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
