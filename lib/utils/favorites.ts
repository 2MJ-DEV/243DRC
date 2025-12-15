import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc } from "firebase/firestore";

/**
 * Vérifie si un projet est dans les favoris de l'utilisateur
 */
export async function isProjectFavorited(projectId: string): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  try {
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(favoritesQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error("Erreur lors de la vérification des favoris:", error);
    return false;
  }
}

/**
 * Ajoute un projet aux favoris
 */
export async function addToFavorites(projectId: string): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  try {
    // Vérifier si déjà en favoris
    const isFavorited = await isProjectFavorited(projectId);
    if (isFavorited) return true;

    await addDoc(collection(db, "favorites"), {
      userId: user.uid,
      projectId: projectId,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    return false;
  }
}

/**
 * Retire un projet des favoris
 */
export async function removeFromFavorites(projectId: string): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  try {
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(favoritesQuery);
    
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des favoris:", error);
    return false;
  }
}

/**
 * Récupère tous les favoris d'un utilisateur
 */
export async function getUserFavorites(): Promise<string[]> {
  const user = auth?.currentUser;
  if (!user || !db) return [];

  try {
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("userId", "==", user.uid)
    );
    const snapshot = await getDocs(favoritesQuery);
    return snapshot.docs.map((doc) => doc.data().projectId);
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error);
    return [];
  }
}

/**
 * Compte le nombre de favoris pour un projet
 * Fonctionne sans authentification - lecture publique
 */
export async function getFavoriteCount(projectId: string): Promise<number> {
  if (!db) return 0;

  try {
    const favoritesQuery = query(
      collection(db, "favorites"),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(favoritesQuery);
    return snapshot.size;
  } catch (error: any) {
    // Ignorer les erreurs de permission silencieusement pour les utilisateurs non connectés
    if (error?.code === 'permission-denied') {
      console.warn("Permission refusée pour lire les favoris. Les règles Firestore doivent permettre la lecture publique.");
      return 0;
    }
    console.error("Erreur lors du comptage des favoris:", error);
    return 0;
  }
}

