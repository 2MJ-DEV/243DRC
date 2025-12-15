import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc } from "firebase/firestore";

/**
 * Vérifie si un projet est liké par l'utilisateur
 */
export async function isProjectLiked(projectId: string): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  try {
    const likesQuery = query(
      collection(db, "likes"),
      where("userId", "==", user.uid),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(likesQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error("Erreur lors de la vérification des likes:", error);
    return false;
  }
}

/**
 * Ajoute un like à un projet
 */
export async function likeProject(projectId: string): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  try {
    // Vérifier si déjà liké
    const isLiked = await isProjectLiked(projectId);
    if (isLiked) return true;

    // Récupérer les informations du projet pour créer la notification
    let projectTitle = "";
    let projectAuthorId = "";
    
    try {
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        projectTitle = projectData.title || "";
        projectAuthorId = projectData.authorId || "";
      }
    } catch (error) {
      console.warn("Impossible de récupérer les informations du projet:", error);
    }

    // Ajouter le like
    await addDoc(collection(db, "likes"), {
      userId: user.uid,
      projectId: projectId,
      createdAt: new Date().toISOString(),
    });

    // Créer une notification pour le propriétaire du projet (si ce n'est pas lui qui like)
    if (projectAuthorId && projectAuthorId !== user.uid) {
      try {
        const { createNotification } = await import("./notifications");
        await createNotification(projectAuthorId, "like", {
          projectId,
          projectTitle,
          fromUserId: user.uid,
          fromUserName: user.displayName || user.email || "Quelqu'un",
        });
      } catch (error) {
        console.warn("Impossible de créer la notification:", error);
        // Ne pas faire échouer le like si la notification échoue
      }
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout du like:", error);
    return false;
  }
}

/**
 * Retire un like d'un projet
 */
export async function unlikeProject(projectId: string): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  try {
    const likesQuery = query(
      collection(db, "likes"),
      where("userId", "==", user.uid),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(likesQuery);
    
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du like:", error);
    return false;
  }
}

/**
 * Compte le nombre de likes pour un projet
 * Fonctionne sans authentification - lecture publique
 */
export async function getLikeCount(projectId: string): Promise<number> {
  if (!db) return 0;

  try {
    const likesQuery = query(
      collection(db, "likes"),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(likesQuery);
    return snapshot.size;
  } catch (error: any) {
    // Ignorer les erreurs de permission silencieusement pour les utilisateurs non connectés
    if (error?.code === 'permission-denied') {
      console.warn("Permission refusée pour lire les likes. Les règles Firestore doivent permettre la lecture publique.");
      return 0;
    }
    console.error("Erreur lors du comptage des likes:", error);
    return 0;
  }
}

