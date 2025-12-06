"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, GitFork, ExternalLink, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function ExplorerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.technologies.some((tech) =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          project.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchTerm, projects]);

  const loadAllProjects = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "projects"),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(q);
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      setProjects(projectsList);
      setFilteredProjects(projectsList);
    } catch (error: any) {
      if (error.code !== 'unavailable') {
        console.error("Erreur lors du chargement des projets:", error);
      }
    } finally {
      setLoading(false);
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

      {filteredProjects.length === 0 ? (
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
      )}
    </div>
  );
}
