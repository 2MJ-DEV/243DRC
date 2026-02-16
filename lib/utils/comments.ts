import { auth, db } from "@/lib/firebaseClient";
import { addDoc, collection } from "firebase/firestore";

export async function addProjectComment(params: {
  projectId: string;
  projectTitle?: string;
  projectAuthorId?: string;
  text: string;
}): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  const trimmed = params.text.trim();
  if (!trimmed) return false;

  try {
    await addDoc(collection(db, "comments"), {
      projectId: params.projectId,
      userId: user.uid,
      userName: user.displayName || user.email || "Utilisateur",
      userPhotoURL: user.photoURL || "",
      text: trimmed,
      createdAt: new Date().toISOString(),
    });

    if (params.projectAuthorId && params.projectAuthorId !== user.uid) {
      try {
        const { createNotification } = await import("./notifications");
        await createNotification(params.projectAuthorId, "comment", {
          projectId: params.projectId,
          projectTitle: params.projectTitle || "Projet",
          fromUserId: user.uid,
          fromUserName: user.displayName || user.email || "Quelqu'un",
          message: `${user.displayName || user.email || "Quelqu'un"} a commenté votre projet "${params.projectTitle || "Projet"}"`,
        });
      } catch (error) {
        console.warn("Impossible de créer la notification de commentaire:", error);
      }
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    return false;
  }
}

