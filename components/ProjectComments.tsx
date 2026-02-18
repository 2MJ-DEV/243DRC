"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { addProjectComment } from "@/lib/utils/comments";
import { auth, db } from "@/lib/firebaseClient";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ToastContainer";

interface CommentItem {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  text: string;
  createdAt: string;
}

interface ProjectCommentsProps {
  projectId: string;
  projectTitle?: string;
  projectAuthorId?: string;
}

export function ProjectComments({
  projectId,
  projectTitle,
  projectAuthorId,
}: ProjectCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (!isOpen || !db) return;

    const commentsQuery = query(
      collection(db, "comments"),
      where("projectId", "==", projectId)
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const list = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as CommentItem)
          .sort((a, b) => {
            const aTs = new Date(a.createdAt || 0).getTime();
            const bTs = new Date(b.createdAt || 0).getTime();
            return bTs - aTs;
          });
        setComments(list);
      },
      (error) => {
        console.error("Erreur chargement commentaires:", error);
      }
    );

    return () => unsubscribe();
  }, [isOpen, projectId]);

  const canComment = Boolean(auth?.currentUser);

  const handleSubmit = async () => {
    if (!canComment) {
      showError("Connexion requise", "Connectez-vous pour commenter");
      return;
    }

    if (!text.trim()) {
      showError("Commentaire vide", "Saisissez un commentaire");
      return;
    }

    setSending(true);
    try {
      const success = await addProjectComment({
        projectId,
        projectTitle,
        projectAuthorId,
        text,
      });

      if (!success) {
        showError("Erreur", "Impossible d'ajouter le commentaire");
        return;
      }

      setText("");
      showSuccess("Commentaire ajouté", "Votre message a été publié");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Commentaires ({comments.length})
      </Button>

      {isOpen && (
        <div className="mt-2 border rounded-md p-3 space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aucun commentaire pour le moment.
            </p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="text-xs border-b pb-2 last:border-b-0">
                  <p className="font-medium">{comment.userName}</p>
                  <p className="text-muted-foreground">{comment.text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Écrire un commentaire..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
            />
            <Button
              type="button"
              variant="rdc"
              size="icon"
              onClick={handleSubmit}
              disabled={sending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
