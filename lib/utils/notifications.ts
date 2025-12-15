import { auth, db } from "@/lib/firebaseClient";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, limit } from "firebase/firestore";

export interface Notification {
  id: string;
  userId: string;
  type: "like" | "favorite" | "comment" | "follow";
  title: string;
  message: string;
  projectId?: string;
  projectTitle?: string;
  fromUserId?: string;
  fromUserName?: string;
  read: boolean;
  createdAt: string;
}

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification(
  userId: string,
  type: Notification["type"],
  data: {
    projectId?: string;
    projectTitle?: string;
    fromUserId?: string;
    fromUserName?: string;
    message?: string;
  }
): Promise<boolean> {
  if (!db) return false;

  try {
    // Ne pas créer de notification si l'utilisateur like son propre projet
    if (data.fromUserId === userId) {
      return false;
    }

    const titles = {
      like: "Nouveau like",
      favorite: "Ajouté aux favoris",
      comment: "Nouveau commentaire",
      follow: "Nouveau follower",
    };

    const defaultMessages = {
      like: `${data.fromUserName || "Quelqu'un"} a liké votre projet "${data.projectTitle || ""}"`,
      favorite: `${data.fromUserName || "Quelqu'un"} a ajouté votre projet "${data.projectTitle || ""}" à ses favoris`,
      comment: `${data.fromUserName || "Quelqu'un"} a commenté votre projet "${data.projectTitle || ""}"`,
      follow: `${data.fromUserName || "Quelqu'un"} vous suit maintenant`,
    };

    await addDoc(collection(db, "notifications"), {
      userId,
      type,
      title: titles[type],
      message: data.message || defaultMessages[type],
      projectId: data.projectId,
      projectTitle: data.projectTitle,
      fromUserId: data.fromUserId,
      fromUserName: data.fromUserName,
      read: false,
      createdAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error);
    return false;
  }
}

/**
 * Récupère les notifications d'un utilisateur
 */
export async function getUserNotifications(limitCount: number = 20): Promise<Notification[]> {
  const user = auth?.currentUser;
  if (!user || !db) return [];

  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    return [];
  }
}

/**
 * Compte les notifications non lues
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const user = auth?.currentUser;
  if (!user || !db) return 0;

  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const snapshot = await getDocs(notificationsQuery);
    return snapshot.size;
  } catch (error) {
    console.error("Erreur lors du comptage des notifications:", error);
    return 0;
  }
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true,
    });
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la notification:", error);
    return false;
  }
}

/**
 * Marque toutes les notifications comme lues
 */
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const user = auth?.currentUser;
  if (!user || !db) return false;

  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false)
    );

    const snapshot = await getDocs(notificationsQuery);
    const updatePromises = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des notifications:", error);
    return false;
  }
}

