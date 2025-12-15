"use client";

import { useState, useEffect } from "react";
import { Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebaseClient";
import { isProjectFavorited, addToFavorites, removeFromFavorites, getFavoriteCount } from "@/lib/utils/favorites";
import { isProjectLiked, likeProject, unlikeProject, getLikeCount } from "@/lib/utils/likes";
import { useToast } from "@/components/ToastContainer";

interface ProjectActionsProps {
  projectId: string;
  compact?: boolean;
}

export function ProjectActions({ projectId, compact = false }: ProjectActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Toujours charger les compteurs (visibles publiquement)
        const [favCount, lkCount] = await Promise.all([
          getFavoriteCount(projectId),
          getLikeCount(projectId),
        ]);

        setFavoriteCount(favCount);
        setLikeCount(lkCount);

        // Charger l'état favoris/likes seulement si l'utilisateur est connecté
        if (auth?.currentUser) {
          const [favorited, liked] = await Promise.all([
            isProjectFavorited(projectId),
            isProjectLiked(projectId),
          ]);

          setIsFavorited(favorited);
          setIsLiked(liked);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des actions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleFavorite = async () => {
    if (!auth?.currentUser) {
      showError("Connexion requise", "Vous devez être connecté pour ajouter aux favoris");
      return;
    }

    setActionLoading(true);
    try {
      if (isFavorited) {
        const success = await removeFromFavorites(projectId);
        if (success) {
          setIsFavorited(false);
          setFavoriteCount((prev) => Math.max(0, prev - 1));
          showSuccess("Retiré des favoris", "Le projet a été retiré de vos favoris");
        }
      } else {
        const success = await addToFavorites(projectId);
        if (success) {
          setIsFavorited(true);
          setFavoriteCount((prev) => prev + 1);
          showSuccess("Ajouté aux favoris", "Le projet a été ajouté à vos favoris");
        }
      }
    } catch (error) {
      showError("Erreur", "Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLike = async () => {
    if (!auth?.currentUser) {
      showError("Connexion requise", "Vous devez être connecté pour liker");
      return;
    }

    setActionLoading(true);
    try {
      if (isLiked) {
        const success = await unlikeProject(projectId);
        if (success) {
          setIsLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        const success = await likeProject(projectId);
        if (success) {
          setIsLiked(true);
          setLikeCount((prev) => prev + 1);
        }
      }
    } catch (error) {
      showError("Erreur", "Une erreur est survenue");
    } finally {
      setActionLoading(false);
    }
  };

  const isAuthenticated = auth?.currentUser !== null;

  if (loading) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size={compact ? "sm" : "default"} disabled>
          <Heart className="w-4 h-4" />
          {!compact && <span className="ml-2">-</span>}
        </Button>
        <Button variant="outline" size={compact ? "sm" : "default"} disabled>
          <Bookmark className="w-4 h-4" />
          {!compact && <span className="ml-2">-</span>}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {/* Bouton Like - Toujours visible avec compteur */}
      <Button
        variant={isLiked ? "default" : "outline"}
        size={compact ? "sm" : "default"}
        onClick={isAuthenticated ? handleLike : () => showError("Connexion requise", "Vous devez être connecté pour liker")}
        disabled={actionLoading || !isAuthenticated}
        className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
        title={!isAuthenticated ? "Connectez-vous pour liker" : ""}
      >
        <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
        {!compact && <span className="ml-2">{likeCount}</span>}
        {compact && <span className="ml-1 text-xs">{likeCount}</span>}
      </Button>
      
      {/* Bouton Favoris - Toujours visible avec compteur */}
      <Button
        variant={isFavorited ? "default" : "outline"}
        size={compact ? "sm" : "default"}
        onClick={isAuthenticated ? handleFavorite : () => showError("Connexion requise", "Vous devez être connecté pour ajouter aux favoris")}
        disabled={actionLoading || !isAuthenticated}
        className={isFavorited ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
        title={!isAuthenticated ? "Connectez-vous pour ajouter aux favoris" : ""}
      >
        <Bookmark className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
        {!compact && <span className="ml-2">{favoriteCount}</span>}
        {compact && <span className="ml-1 text-xs">{favoriteCount}</span>}
      </Button>
    </div>
  );
}

