"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState({
    bio: "",
    location: "",
    university: "",
    jobTitle: "",
    github: "",
    linkedin: "",
    twitter: "",
  });
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
      loadProfile(currentUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadProfile = async (uid: string) => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile({
          bio: data.bio || "",
          location: data.location || "",
          university: data.university || "",
          jobTitle: data.jobTitle || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
          twitter: data.twitter || "",
        });
      }
    } catch (error: any) {
      if (error.code !== 'unavailable') {
        console.error("Erreur lors du chargement du profil:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !db) return;

    try {
      setSaving(true);
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        ...userProfile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du profil");
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>Ces informations sont publiques et visibles par tous</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            {user.photoURL && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-20 h-20 rounded-full border-4 border-primary/20"
              />
            )}
            <div>
              <p className="font-semibold text-lg">{user.displayName}</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="jobTitle">Statut d'emploi</Label>
              <Input
                id="jobTitle"
                placeholder="Ex: Développeur front-end, Étudiant..."
                value={userProfile.jobTitle}
                onChange={(e) => setUserProfile({ ...userProfile, jobTitle: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="location">Emplacement</Label>
              <Input
                id="location"
                placeholder="Ex: Kinshasa, Lubumbashi..."
                value={userProfile.location}
                onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="university">Université ou école supérieure</Label>
              <Input
                id="university"
                placeholder="Ex: Université de Kinshasa..."
                value={userProfile.university}
                onChange={(e) => setUserProfile({ ...userProfile, university: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                placeholder="Parlez-nous de vous..."
                value={userProfile.bio}
                onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
          <CardDescription>Ajoutez vos liens de réseaux sociaux</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              placeholder="https://github.com/votre-username"
              value={userProfile.github}
              onChange={(e) => setUserProfile({ ...userProfile, github: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/votre-username"
              value={userProfile.linkedin}
              onChange={(e) => setUserProfile({ ...userProfile, linkedin: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="twitter">Twitter/X</Label>
            <Input
              id="twitter"
              placeholder="https://twitter.com/votre-username"
              value={userProfile.twitter}
              onChange={(e) => setUserProfile({ ...userProfile, twitter: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
