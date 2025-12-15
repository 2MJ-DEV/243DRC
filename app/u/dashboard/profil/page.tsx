"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ToastContainer";
import { Edit, MapPin, Briefcase, GraduationCap, Github, Linkedin, Twitter, ExternalLink } from "lucide-react";

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    bio: "",
    location: "",
    university: "",
    jobTitle: "",
    github: "",
    linkedin: "",
    twitter: "",
  });
  const [originalProfile, setOriginalProfile] = useState({
    bio: "",
    location: "",
    university: "",
    jobTitle: "",
    github: "",
    linkedin: "",
    twitter: "",
  });
  const router = useRouter();
  const { showSuccess, showError } = useToast();

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
        const profileData = {
          bio: data.bio || "",
          location: data.location || "",
          university: data.university || "",
          jobTitle: data.jobTitle || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
          twitter: data.twitter || "",
        };
        setUserProfile(profileData);
        setOriginalProfile(profileData);
      }
    } catch (error: any) {
      if (error.code !== "unavailable") {
        console.error("Erreur lors du chargement du profil:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setUserProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user || !db) return;

    try {
      setSaving(true);
      const docRef = doc(db, "users", user.uid);
      await setDoc(
        docRef,
        {
          ...userProfile,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setOriginalProfile(userProfile);
      setIsEditing(false);
      showSuccess("Profil mis à jour", "Vos modifications ont été enregistrées avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      showError("Erreur", "Une erreur est survenue lors de la sauvegarde du profil");
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Ces informations sont publiques et visibles par tous
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Modifier le profil
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-20 h-20 rounded-full border-4 border-primary/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-20 h-20 rounded-full border-4 border-primary/20 bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl ${user.photoURL ? 'hidden' : ''}`}
              >
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-lg">{user.displayName || "Utilisateur"}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="jobTitle">Statut d'emploi</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Ex: Développeur front-end, Étudiant..."
                    value={userProfile.jobTitle}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, jobTitle: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="location">Emplacement</Label>
                  <Input
                    id="location"
                    placeholder="Ex: Kinshasa, Lubumbashi..."
                    value={userProfile.location}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="university">
                    Université ou école supérieure
                  </Label>
                  <Input
                    id="university"
                    placeholder="Ex: Université de Kinshasa..."
                    value={userProfile.university}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        university: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    value={userProfile.bio}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, bio: e.target.value })
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {userProfile.jobTitle && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Statut d'emploi:</span>
                    <span className="font-medium">{userProfile.jobTitle}</span>
                  </div>
                )}
                {userProfile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Emplacement:</span>
                    <span className="font-medium">{userProfile.location}</span>
                  </div>
                )}
                {userProfile.university && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Université:</span>
                    <span className="font-medium">{userProfile.university}</span>
                  </div>
                )}
                {userProfile.bio && (
                  <div>
                    <p className="text-muted-foreground mb-2">Bio:</p>
                    <p className="text-foreground">{userProfile.bio}</p>
                  </div>
                )}
                {!userProfile.jobTitle && !userProfile.location && !userProfile.university && !userProfile.bio && (
                  <p className="text-muted-foreground italic">Aucune information n'a été renseignée. Cliquez sur "Modifier le profil" pour ajouter vos informations.</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
          <CardDescription>
            {isEditing ? "Ajoutez vos liens de réseaux sociaux" : "Vos liens de réseaux sociaux"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/votre-username"
                  value={userProfile.github}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, github: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/votre-username"
                  value={userProfile.linkedin}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, linkedin: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/votre-username"
                  value={userProfile.twitter}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, twitter: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              {userProfile.github && (
                <a
                  href={userProfile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                >
                  <Github className="w-5 h-5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {userProfile.linkedin && (
                <a
                  href={userProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {userProfile.twitter && (
                <a
                  href={userProfile.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                  <span>Twitter</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {!userProfile.github && !userProfile.linkedin && !userProfile.twitter && (
                <p className="text-muted-foreground italic">Aucun lien de réseau social n'a été ajouté.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Annuler
          </Button>
          <Button variant="rdc" onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
          </Button>
        </div>
      )}
    </div>
  );
}
