"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseClient";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { Notification } from "@/lib/utils/notifications";

export function useNotifications(maxNotifications: number = 20) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth?.currentUser;
    if (!user || !db) {
      setLoading(false);
      return;
    }

    // Écouter les notifications en temps réel
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(maxNotifications)
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      (snapshot) => {
        const notificationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];

        setNotifications(notificationsList);
        setUnreadCount(notificationsList.filter((n) => !n.read).length);
        setLoading(false);
      },
      (error: any) => {
        console.error("Erreur lors de l'écoute des notifications:", error);
        
        // Si l'index est en cours de construction, c'est normal
        if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
          console.info("L'index Firestore est en cours de construction. Les notifications seront disponibles dans quelques minutes.");
        }
        
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxNotifications]);

  return { notifications, unreadCount, loading };
}

