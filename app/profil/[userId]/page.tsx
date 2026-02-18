"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
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
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
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

        const projectsQuery = query(
          collection(db, "projects"),
          where("authorId", "==", userId),
          orderBy("createdAt", "desc")
        );

        try {
          const projectsSnapshot = await getDocs(projectsQuery);
          const projectsList = projectsSnapshot.docs.map((projectDoc) => ({
            id: projectDoc.id,
            ...projectDoc.data(),
          })) as Project[];
          setProjects(projectsList);
        } catch (error: unknown) {
          const isFailedPreconditionError =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: string }).code === "failed-precondition";

          if (isFailedPreconditionError) {
            const projectsQuerySimple = query(collection(db, "projects"), where("authorId", "==", userId));
            const projectsSnapshot = await getDocs(projectsQuerySimple);
            const projectsList = projectsSnapshot.docs.map((projectDoc) => ({
              id: projectDoc.id,
              ...projectDoc.data(),
            })) as Project[];

            projectsList.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            });

            setProjects(projectsList);
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
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">Profil introuvable</h2>
            <p className="mb-6 text-muted-foreground">Ce profil n'existe pas ou n'est plus disponible.</p>
            <Button onClick={() => router.push("/explorer-les-projets")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour a l'exploration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getGithubInfo = (repoUrl: string) => {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(2,132,199,0.08)_0%,rgba(16,185,129,0.04)_45%,transparent_100%)] pt-24 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.back()} className="mb-4 rounded-full px-5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        <Card className="mb-8 overflow-hidden border shadow-xl shadow-sky-100/40">
          <div className="relative h-36 bg-gradient-to-r from-sky-500/25 via-cyan-500/15 to-emerald-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.5),transparent_40%)]" />
          </div>

          <CardContent className="pt-0 pb-6">
            <div className="-mt-16 flex flex-col gap-6 md:-mt-20 md:flex-row">
              <div className="relative mx-auto flex-shrink-0 md:mx-0">
                {userProfile.photoURL && !imageError ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl ring-4 ring-sky-100/70 md:h-40 md:w-40"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-sky-500/25 to-emerald-500/20 text-5xl font-semibold text-sky-700 shadow-xl ring-4 ring-sky-100/70 md:h-40 md:w-40">
                    {userProfile.displayName[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <div className="flex-1 pt-4 md:pt-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h1 className="mb-3 text-3xl font-bold md:text-4xl">{userProfile.displayName}</h1>

                    <div className="mb-4 space-y-2">
                      {userProfile.jobTitle && (
                        <div className="flex items-center gap-2 text-foreground/80">
                          <Briefcase className="h-4 w-4 text-sky-600" />
                          <span className="font-medium">{userProfile.jobTitle}</span>
                        </div>
                      )}
                      {userProfile.location && (
                        <div className="flex items-center gap-2 text-foreground/70">
                          <MapPin className="h-4 w-4 text-sky-600" />
                          <span>{userProfile.location}</span>
                        </div>
                      )}
                      {userProfile.university && (
                        <div className="flex items-center gap-2 text-foreground/70">
                          <GraduationCap className="h-4 w-4 text-sky-600" />
                          <span>{userProfile.university}</span>
                        </div>
                      )}
                    </div>

                    {userProfile.bio && (
                      <p className="mb-4 max-w-2xl rounded-xl border border-border/60 bg-muted/25 p-3 leading-relaxed text-foreground/80">
                        {userProfile.bio}
                      </p>
                    )}

                    {(userProfile.github || userProfile.linkedin || userProfile.twitter) && (
                      <div className="mt-4 flex gap-3">
                        {userProfile.github && (
                          <a
                            href={userProfile.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-border bg-background p-3 shadow-sm transition-all hover:scale-105 hover:bg-sky-50"
                            title="GitHub"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                        )}
                        {userProfile.linkedin && (
                          <a
                            href={userProfile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-border bg-background p-3 shadow-sm transition-all hover:scale-105 hover:bg-sky-50"
                            title="LinkedIn"
                          >
                            <Linkedin className="h-5 w-5" />
                          </a>
                        )}
                        {userProfile.twitter && (
                          <a
                            href={userProfile.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-border bg-background p-3 shadow-sm transition-all hover:scale-105 hover:bg-sky-50"
                            title="Twitter"
                          >
                            <Twitter className="h-5 w-5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-[220px] flex-col gap-3">
                    <Card className="border bg-gradient-to-br from-sky-500/10 to-emerald-500/10 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-baseline justify-between">
                          <div className="text-4xl font-bold text-sky-700">{projects.length}</div>
                          <div className="text-sm font-medium text-muted-foreground">Projets</div>
                        </div>
                      </CardContent>
                    </Card>

                    {auth?.currentUser?.uid === userId && (
                      <Button variant="outline" onClick={() => router.push("/u/dashboard/profil")} className="w-full rounded-xl">
                        Modifier mon profil
                      </Button>
                    )}

                    {auth?.currentUser?.uid && auth.currentUser.uid !== userId && (
                      <Button
                        variant="rdc"
                        onClick={() => router.push(`/u/dashboard/messages?userId=${userId}`)}
                        className="w-full rounded-xl shadow-md"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Envoyer un message
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {userProfile.github ? (
          <div className="mb-8">
            <GitHubActivity githubUrl={userProfile.github} />
          </div>
        ) : (
          <div className="mb-8">
            <Card>
              <CardContent className="flex items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucun lien GitHub renseigne. Ajoutez votre lien GitHub dans votre profil pour afficher votre activite.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="text-2xl font-bold md:text-3xl">
              Projets <span className="text-muted-foreground">({projects.length})</span>
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {projects.length === 0 ? (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Code className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Aucun projet</h3>
                <p className="text-muted-foreground">Cet utilisateur n'a pas encore ajoute de projets.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => {
                const githubInfo = getGithubInfo(project.repoUrl);
                const imageUrl = githubInfo
                  ? `https://opengraph.githubassets.com/1/${githubInfo.owner}/${githubInfo.repo}`
                  : null;

                return (
                  <Card key={project.id} className="group overflow-hidden border-2 transition-all duration-300 hover:shadow-xl">
                    {imageUrl && (
                      <div className="p-2">
                        <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                          <Image
                            src={imageUrl}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <CardTitle className="mb-2 line-clamp-2 text-xl transition-colors group-hover:text-primary">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">{project.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>{project.stars.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <GitFork className="h-4 w-4 text-blue-500" />
                          <span>{project.forks.toLocaleString()}</span>
                        </div>
                      </div>

                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.slice(0, 4).map((tech, index) => (
                            <span
                              key={index}
                              className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 4 && (
                            <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              +{project.technologies.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button asChild variant="rdc" className="w-full transition-all group-hover:shadow-md">
                        <Link href={`/projets/${project.id}`}>
                          Voir le projet
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
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
