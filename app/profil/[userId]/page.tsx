"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Github, 
  Linkedin, 
  Twitter, 
  ExternalLink,
  Star,
  GitFork,
  Code,
  Users,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import GitHubActivity from "@/components/GitHubActivity";

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  university?: string;
  jobTitle?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  createdAt?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  technologies: string[];
  stars: number;
  forks: number;
  createdAt: string;
}

export default function ProfilPublicPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        // Charger le profil utilisateur depuis Firestore
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (!userDoc.exists()) {
          // Si le document n'existe pas dans Firestore, essayer de récupérer depuis auth
          // Pour l'instant, on affiche une erreur
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        console.log("Profil public - Données utilisateur:", userData);
        console.log("Profil public - Lien GitHub:", userData.github);
        
        setUserProfile({
          uid: userId,
          displayName: userData.displayName || userData.email?.split("@")[0] || "Utilisateur",
          email: userData.email || "",
          photoURL: userData.photoURL,
          bio: userData.bio || "",
          location: userData.location || "",
          university: userData.university || "",
          jobTitle: userData.jobTitle || "",
          github: userData.github || "",
          linkedin: userData.linkedin || "",
          twitter: userData.twitter || "",
          createdAt: userData.createdAt || "",
        });

        // Charger les projets de l'utilisateur
        if (db) {
          const projectsQuery = query(
            collection(db, "projects"),
            where("authorId", "==", userId),
            orderBy("createdAt", "desc")
          );

          try {
            const projectsSnapshot = await getDocs(projectsQuery);
            const projectsList = projectsSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Project[];
            setProjects(projectsList);
          } catch (error: any) {
            // Si l'index n'existe pas, charger sans orderBy
            if (error.code === 'failed-precondition') {
              const projectsQuerySimple = query(
                collection(db, "projects"),
                where("authorId", "==", userId)
              );
              const projectsSnapshot = await getDocs(projectsQuerySimple);
              const projectsList = projectsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as Project[];
              // Trier manuellement par date
              projectsList.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
              });
              setProjects(projectsList);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Profil introuvable</h2>
            <p className="text-muted-foreground mb-6">
              Ce profil n'existe pas ou n'est plus disponible.
            </p>
            <Button onClick={() => router.push("/explorer-les-projets")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'exploration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getGithubInfo = (repoUrl: string) => {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* En-tête du profil - Design amélioré */}
        <Card className="mb-8 overflow-hidden border-2 shadow-lg">
          {/* Bannière de fond */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          </div>
          
          <CardContent className="pt-0 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
              {/* Photo de profil - Plus grande et avec ombre */}
              <div className="flex-shrink-0 relative">
                <div className="relative">
                  {userProfile.photoURL && !imageError ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-xl object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold text-5xl shadow-xl">
                      {userProfile.displayName[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
              </div>

              {/* Informations principales */}
              <div className="flex-1 pt-4 md:pt-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      {userProfile.displayName}
                    </h1>
                    
                    <div className="space-y-2 mb-4">
                      {userProfile.jobTitle && (
                        <div className="flex items-center gap-2 text-foreground/80">
                          <Briefcase className="w-4 h-4 text-primary" />
                          <span className="font-medium">{userProfile.jobTitle}</span>
                        </div>
                      )}
                      {userProfile.location && (
                        <div className="flex items-center gap-2 text-foreground/70">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{userProfile.location}</span>
                        </div>
                      )}
                      {userProfile.university && (
                        <div className="flex items-center gap-2 text-foreground/70">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span>{userProfile.university}</span>
                        </div>
                      )}
                    </div>

                    {userProfile.bio && (
                      <p className="text-foreground/80 leading-relaxed mb-4 max-w-2xl">
                        {userProfile.bio}
                      </p>
                    )}

                    {/* Liens sociaux - Design amélioré */}
                    {(userProfile.github || userProfile.linkedin || userProfile.twitter) && (
                      <div className="flex gap-3 mt-4">
                        {userProfile.github && (
                          <a
                            href={userProfile.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-all hover:scale-110 border border-border"
                            title="GitHub"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {userProfile.linkedin && (
                          <a
                            href={userProfile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-all hover:scale-110 border border-border"
                            title="LinkedIn"
                          >
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                        {userProfile.twitter && (
                          <a
                            href={userProfile.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-all hover:scale-110 border border-border"
                            title="Twitter"
                          >
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Statistiques - Design amélioré */}
                  <div className="flex md:flex-col gap-6 md:gap-4">
                    <Card className="border-2 shadow-md">
                      <CardContent className="p-4 text-center flex justify-center items-center gap-2">
                        <div className="text-4xl font-bold text-primary mb-1">{projects.length}</div>
                        <div className="text-sm text-muted-foreground font-medium">Projets</div>
                      </CardContent>
                    </Card>
                    {auth?.currentUser?.uid === userId && (
                      <Button
                        variant="outline"
                        onClick={() => router.push("/u/dashboard/profil")}
                        className="md:w-full"
                      >
                        Modifier mon profil
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activité GitHub */}
        {userProfile.github ? (
          <div className="mb-8">
            <GitHubActivity githubUrl={userProfile.github} />
          </div>
        ) : (
          <div className="mb-8">
            <Card>
              <CardContent className="py-8 text-center flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Aucun lien GitHub renseigné. Ajoutez votre lien GitHub dans votre profil pour afficher votre activité.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projets */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Projets <span className="text-muted-foreground">({projects.length})</span>
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>

          {projects.length === 0 ? (
            <Card className="border-2">
              <CardContent className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Code className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Aucun projet</h3>
                <p className="text-muted-foreground">
                  Cet utilisateur n&#39;a pas encore ajouté de projets.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const githubInfo = getGithubInfo(project.repoUrl);
                const imageUrl = githubInfo
                  ? `https://opengraph.githubassets.com/1/${githubInfo.owner}/${githubInfo.repo}`
                  : null;

                return (
                  <Card key={project.id} className="hover:shadow-xl transition-all duration-300 border-2 overflow-hidden group">
                    {imageUrl && (
                      <div className="p-2">
                        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{project.stars.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <GitFork className="w-4 h-4 text-blue-500" />
                          <span>{project.forks.toLocaleString()}</span>
                        </div>
                      </div>

                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 4).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-md border border-primary/20"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="px-2.5 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-md border border-border">
                              +{project.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        variant="rdc"
                        className="w-full group-hover:shadow-md transition-all"
                        onClick={() => window.open(project.repoUrl, "_blank")}
                      >
                        Voir le projet
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

