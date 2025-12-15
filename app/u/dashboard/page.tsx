"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Search, FolderGit2, FolderGit2Icon, GitPullRequestCreateArrow, UsersRound } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      router.push("/");
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user || !db) return;

    try {
      const projectsQuery = query(
        collection(db, "projects"),
        where("authorId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(3)
        // Note: Cette requête nécessite un index composite dans Firestore
        // Collection: projects, Fields: authorId (Ascending) + createdAt (Descending)
      );
      
      const snapshot = await getDocs(projectsQuery);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserProjects(projects);
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error);
      
      // Gestion d'erreur améliorée
      if (error.code === 'failed-precondition') {
        console.error("Index Firestore manquant. Créez l'index composite requis dans Firebase Console.");
      } else if (error.code === 'permission-denied') {
        console.error("Permission refusée. Vérifiez vos règles Firestore.");
      } else if (error.code !== 'unavailable') {
        console.error("Erreur lors du chargement des données:", error);
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Projets</CardTitle>
                <CardDescription>Vos projets open source</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{userProjects.length}</p>
                <FolderGit2Icon />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contributions</CardTitle>
                <CardDescription>Cette semaine</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">0</p>
                <GitPullRequestCreateArrow />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communauté</CardTitle>
                <CardDescription>Vos followers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">0</p>
                <UsersRound />
              </CardContent>
            </Card>
        </div>

      {/* Projets récents */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Vos projets récents</h2>
          <Link href="/u/dashboard/mes-projets">
            <Button variant="ghost" size="sm">Voir tout</Button>
          </Link>
        </div>
        {userProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 flex flex-col items-center text-center">
              <FolderGit2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Vous n&#39;avez pas encore de projets
              </p>
              <Link href="/u/dashboard/ajouter-projet">
                <Button variant="rdc">Ajouter votre premier projet</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Voir le projet
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
