"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Code, GitFork, Loader, Star, Users } from "lucide-react";
import { Button } from "./ui/button";

interface FeaturedProjectItem {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  technologies: string[];
  authorName: string;
  stars: number;
  forks: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(num);
}

function getGithubInfo(link: string) {
  const match = link.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }
  return null;
}

function ProjectCard({ project }: { project: FeaturedProjectItem }) {
  const displayedTechnologies = project.technologies.slice(0, 4);
  const remainingCount = Math.max(0, project.technologies.length - 4);

  const githubInfo = getGithubInfo(project.repoUrl);
  const imageUrl = githubInfo
    ? `https://opengraph.githubassets.com/1/${githubInfo.owner}/${githubInfo.repo}`
    : null;

  return (
    <div className="relative h-full">
      <Card className="flex flex-col h-full transition-shadow duration-300 overflow-hidden">
        {imageUrl && (
          <div className="p-2">
            <div className="relative hover:border border-[#007FFF] w-full h-48 bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-sm">
              <Image
                src={imageUrl}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        )}

        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-[#007FFF] line-clamp-2">
              {project.title}
            </CardTitle>

            <div className="flex gap-4 text-gray-600 text-sm whitespace-nowrap">
              <span className="flex items-center gap-1">
                <Star size={15} /> {formatNumber(project.stars)}
              </span>
              <span className="flex items-center gap-1">
                <GitFork size={15} /> {formatNumber(project.forks)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 my-4">
            {displayedTechnologies.map((tech, i) => (
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

          <div className="flex justify-between text-sm text-gray-600 mt-auto">
            <span className="flex items-center gap-1">
              <Users size={15} /> {project.authorName || "Auteur inconnu"}
            </span>
            <span className="flex items-center gap-1">
              <Code size={15} /> {project.technologies[0] || "Autre"}
            </span>
          </div>
        </CardContent>

        <CardFooter className="border-t">
          <Button asChild variant="rdc" className="w-full">
            <Link href={`/projets/${project.id}`} className="flex justify-center items-center gap-2">
              Voir le projet
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function FeaturedProject() {
  const [projects, setProjects] = useState<FeaturedProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProjects = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const projectsQuery = query(
          collection(db, "projects"),
          where("stars", ">", 0),
          orderBy("stars", "desc"),
          limit(3)
        );

        const snapshot = await getDocs(projectsQuery);
        const projectsList = snapshot.docs.map((projectDoc) => {
          const data = projectDoc.data();
          return {
            id: projectDoc.id,
            title: (data.title as string) || "Projet sans titre",
            description: (data.description as string) || "",
            repoUrl: (data.repoUrl as string) || "",
            technologies: Array.isArray(data.technologies)
              ? (data.technologies as string[])
              : [],
            authorName: (data.authorName as string) || "Auteur inconnu",
            stars: typeof data.stars === "number" ? data.stars : 0,
            forks: typeof data.forks === "number" ? data.forks : 0,
          } as FeaturedProjectItem;
        });

        setProjects(projectsList);
      } catch (error) {
        console.error("Erreur chargement projets populaires:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadFeaturedProjects();
  }, []);

  return (
    <section className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Projets Open Source Populaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Classement des projets les plus etoiles de la communaute 243 DRC.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-7 h-7 animate-spin text-[#007FFF]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-14 border rounded-xl">
            <p className="text-muted-foreground">Aucun projet populaire disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 skewbox p-4 border">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

