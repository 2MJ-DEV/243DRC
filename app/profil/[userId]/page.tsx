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
    <div className="min-h-screen bg-background pt-24 pb-12">
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

        {/* En-tête du profil */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo de profil */}
              <div className="flex-shrink-0">
                {userProfile.photoURL && !imageError ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="w-32 h-32 rounded-full border-4 border-primary/20 object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-semibold text-4xl">
                    {userProfile.displayName[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{userProfile.displayName}</h1>
                {userProfile.jobTitle && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{userProfile.jobTitle}</span>
                  </div>
                )}
                {userProfile.location && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{userProfile.location}</span>
                  </div>
                )}
                {userProfile.university && (
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <GraduationCap className="w-4 h-4" />
                    <span>{userProfile.university}</span>
                  </div>
                )}
                {userProfile.bio && (
                  <p className="text-muted-foreground mb-4">{userProfile.bio}</p>
                )}

                {/* Liens sociaux */}
                <div className="flex gap-3">
                  {userProfile.github && (
                    <a
                      href={userProfile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {userProfile.linkedin && (
                    <a
                      href={userProfile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {userProfile.twitter && (
                    <a
                      href={userProfile.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Statistiques */}
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{projects.length}</div>
                  <div className="text-sm text-muted-foreground">Projets</div>
                </div>
                {auth?.currentUser?.uid === userId && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/u/dashboard/profil")}
                  >
                    Modifier mon profil
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projets */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Projets ({projects.length})
          </h2>

          {projects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Code className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg mb-2">Aucun projet</h3>
                <p className="text-muted-foreground">
                  Cet utilisateur n'a pas encore ajouté de projets.
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
                  <Card key={project.id} className="hover:shadow-lg transition-shadow">
                    {imageUrl && (
                      <div className="p-2">
                        <div className="relative w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden">
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
                      <CardTitle className="text-xl line-clamp-2">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{project.stars.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <GitFork className="w-4 h-4 text-blue-500" />
                          <span>{project.forks.toLocaleString()}</span>
                        </div>
                      </div>

                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                              +{project.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="rdc"
                        className="w-full"
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

