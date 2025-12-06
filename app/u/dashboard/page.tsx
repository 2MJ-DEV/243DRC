"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Search, FolderGit2 } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
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
      );
      
      const snapshot = await getDocs(projectsQuery);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserProjects(projects);
    } catch (error: any) {
      // Ignorer les erreurs offline au chargement initial
      if (error.code !== 'unavailable') {
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
      {/* En-tête de la page */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bienvenue, {user.displayName || "Développeur"} ! 👋
        </h1>
        <p className="text-muted-foreground">Gérez vos projets et explorez la communauté 243 DRC</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Projets</CardTitle>
                <CardDescription>Vos projets open source</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{userProjects.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contributions</CardTitle>
                <CardDescription>Cette semaine</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communauté</CardTitle>
                <CardDescription>Vos followers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">0</p>
              </CardContent>
            </Card>
        </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/u/dashboard/ajouter-projet">
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-center gap-3 h-24">
                <Plus className="w-6 h-6" />
                <span className="text-lg font-medium">Ajouter un projet</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/u/dashboard/explorer">
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex items-center justify-center gap-3 h-24">
                <Search className="w-6 h-6" />
                <span className="text-lg font-medium">Explorer des projets</span>
              </CardContent>
            </Card>
          </Link>
        </div>
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
            <CardContent className="py-12 text-center">
              <FolderGit2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore de projets
              </p>
              <Link href="/u/dashboard/ajouter-projet">
                <Button>Ajouter votre premier projet</Button>
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
