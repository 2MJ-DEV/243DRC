"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { collection, getDocs, query, orderBy, limit, startAfter, DocumentSnapshot, QuerySnapshot, Query } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Github, 
  Linkedin, 
  Twitter, 
  Users,
  Search,
  User as UserIcon,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/lib/hooks/useDebounce";

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

// Composant pour la carte utilisateur
function UserCard({ user }: { user: UserProfile }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Photo de profil */}
          <div className="flex-shrink-0">
            {user.photoURL && !imageError ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-16 h-16 rounded-full border-2 border-primary/20 object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl">
                {user.displayName[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg mb-1 truncate">
              {user.displayName}
            </CardTitle>
            <CardDescription className="truncate">
              {user.email}
            </CardDescription>
            {user.jobTitle && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Briefcase className="w-3 h-3" />
                <span className="truncate">{user.jobTitle}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {user.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {user.university && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span className="line-clamp-1">{user.university}</span>
            </div>
          )}
          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Liens sociaux */}
          {(user.github || user.linkedin || user.twitter) && (
            <div className="flex gap-2 pt-2 border-t">
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {user.twitter && (
                <a
                  href={user.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardContent className="pt-0">
        <Link href={`/profil/${user.uid}`}>
          <Button variant="rdc" className="w-full">
            <UserIcon className="w-4 h-4 mr-2" />
            Voir le profil
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function RencontresPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
      loadUsers();
    });

    return () => unsubscribe();
  }, [router]);

  const loadUsers = async () => {
    if (!db) {
      setLoading(false);
      return;
    }

    const firestoreDb = db; // Stocker db dans une constante locale pour TypeScript

    try {
      // Charger TOUS les utilisateurs depuis Firestore avec pagination
      let lastDoc: DocumentSnapshot | null = null;
      let hasMore = true;
      const allUsersList: UserProfile[] = [];

      while (hasMore) {
        let usersQuery: Query;
        
        try {
          // Essayer avec orderBy d'abord
          if (lastDoc) {
            usersQuery = query(
              collection(firestoreDb, "users"),
              orderBy("createdAt", "desc"),
              startAfter(lastDoc),
              limit(100)
            );
          } else {
            usersQuery = query(
              collection(firestoreDb, "users"),
              orderBy("createdAt", "desc"),
              limit(100)
            );
          }

          const snapshot: QuerySnapshot = await getDocs(usersQuery);
          
          if (snapshot.empty) {
            hasMore = false;
            break;
          }

          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            allUsersList.push({
              uid: doc.id,
              displayName: data.displayName || data.email?.split("@")[0] || "Utilisateur",
              email: data.email || "",
              photoURL: data.photoURL,
              bio: data.bio || "",
              location: data.location || "",
              university: data.university || "",
              jobTitle: data.jobTitle || "",
              github: data.github || "",
              linkedin: data.linkedin || "",
              twitter: data.twitter || "",
              createdAt: data.createdAt || data.updatedAt || new Date().toISOString(),
            });
          });

          // Si on a moins de 100 résultats, c'est la dernière page
          if (snapshot.docs.length < 100) {
            hasMore = false;
          } else {
            lastDoc = snapshot.docs[snapshot.docs.length - 1];
          }
        } catch (error: any) {
          // Si l'index n'existe pas ou erreur, charger TOUS les utilisateurs sans orderBy
          if (error.code === 'failed-precondition' || error.code === 'permission-denied') {
            // Charger tous les utilisateurs sans limite
            const usersQuerySimple = query(collection(db, "users"));
            const snapshot = await getDocs(usersQuerySimple);
            
            snapshot.docs.forEach((doc) => {
              // Éviter les doublons
              if (!allUsersList.find(u => u.uid === doc.id)) {
                const data = doc.data();
                allUsersList.push({
                  uid: doc.id,
                  displayName: data.displayName || data.email?.split("@")[0] || "Utilisateur",
                  email: data.email || "",
                  photoURL: data.photoURL,
                  bio: data.bio || "",
                  location: data.location || "",
                  university: data.university || "",
                  jobTitle: data.jobTitle || "",
                  github: data.github || "",
                  linkedin: data.linkedin || "",
                  twitter: data.twitter || "",
                  createdAt: data.createdAt || data.updatedAt || new Date().toISOString(),
                });
              }
            });

            // Trier manuellement par date
            allUsersList.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA;
            });

            hasMore = false; // Arrêter après avoir chargé tous les utilisateurs
          } else {
            console.error("Erreur lors du chargement des utilisateurs:", error);
            hasMore = false;
          }
        }
      }

      // Exclure l'utilisateur actuel de la liste
      const currentUser = auth?.currentUser;
      const filtered = allUsersList.filter(user => user.uid !== currentUser?.uid);
      
      console.log(`Chargé ${filtered.length} utilisateurs depuis Firestore`);
      setUsers(filtered);
      setFilteredUsers(filtered);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs avec le terme de recherche debouncé
  useEffect(() => {
    if (debouncedSearchTerm) {
      const filtered = users.filter(
        (user) =>
          user.displayName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (user.bio && user.bio.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
          (user.location && user.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
          (user.jobTitle && user.jobTitle.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
          (user.university && user.university.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [debouncedSearchTerm, users]);

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
        <h1 className="text-3xl font-bold mb-2">Rencontres</h1>
        <p className="text-muted-foreground">
          Découvrez et connectez-vous avec d'autres développeurs de la communauté 243 DRC
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email, localisation, poste..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredUsers.length} développeur{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="py-16 px-6">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Essayez avec d'autres mots-clés pour trouver des développeurs de la communauté."
                    : "Aucun autre utilisateur n'est inscrit pour le moment. Revenez plus tard pour découvrir d'autres développeurs !"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.uid} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

