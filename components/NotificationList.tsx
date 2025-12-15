"use client";

import { useNotifications } from "@/lib/hooks/useNotifications";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/utils/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, MessageSquare, UserPlus, X, CheckCheck, Bell } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ToastContainer";

// Fonction simple pour formater la date sans dépendance externe
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "à l'instant";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `il y a ${weeks} semaine${weeks > 1 ? "s" : ""}`;
  }
}

interface NotificationListProps {
  onClose?: () => void;
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, unreadCount, loading } = useNotifications();
  const { showError } = useToast();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "favorite":
        return <Bookmark className="w-5 h-5 text-yellow-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      showError("Erreur", "Impossible de marquer la notification comme lue");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      showError("Erreur", "Impossible de marquer toutes les notifications comme lues");
    }
  };

  return (
    <Card className="shadow-xl border-2 max-h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({unreadCount} non lue{unreadCount > 1 ? "s" : ""})
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 text-xs"
                title="Tout marquer comme lu"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Tout lire
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-y-auto flex-1">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Chargement...</p>
            <p className="text-xs text-muted-foreground mt-2">
              Si cela prend trop de temps, l'index Firestore est peut-être en cours de construction.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/50 transition-colors ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                        {notification.projectId && (
                          <Link
                            href={`/explorer-les-projets`}
                            onClick={onClose}
                            className="text-xs text-primary hover:underline mt-1 inline-block"
                          >
                            Voir le projet
                          </Link>
                        )}
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marquer comme lu"
                        >
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

