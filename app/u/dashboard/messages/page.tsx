"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ToastContainer";
import {
  ChevronLeft,
  Circle,
  Files,
  Image as ImageIcon,
  Link2,
  Paperclip,
  Search,
  SendHorizonal,
  Users,
  Video,
} from "lucide-react";

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
}

interface PrivateMessage {
  id: string;
  participants: string[];
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError, showSuccess } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const isFirstSnapshot = useRef(true);

  useEffect(() => {
    if (!auth) {
      router.push("/");
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
        return;
      }
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const targetUser = searchParams.get("userId");
    if (targetUser) {
      setSelectedUserId(targetUser);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!db || !currentUser) return;

      try {
        const usersSnapshot = await getDocs(query(collection(db, "users")));
        const usersList = usersSnapshot.docs
          .map((userDoc) => ({
            uid: userDoc.id,
            displayName: (userDoc.data().displayName as string) || "Utilisateur",
            email: (userDoc.data().email as string) || "",
          }))
          .filter((user) => user.uid !== currentUser.uid);
        setUsers(usersList);
      } catch (error: unknown) {
        console.error("Erreur chargement contacts:", error);
        const firestoreError = error as { code?: string };
        showError(
          "Erreur",
          `Impossible de charger les contacts (${firestoreError.code || "unknown"})`
        );
      }
    };

    void loadUsers();
  }, [currentUser, showError]);

  useEffect(() => {
    if (!db || !currentUser) return;

    setLoading(true);
    isFirstSnapshot.current = true;

    const messagesQuery = query(
      collection(db, "privateMessages"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesList = snapshot.docs
          .map((messageDoc) => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          }) as PrivateMessage)
          .sort((a, b) => {
            const aTs = new Date(a.createdAt || 0).getTime();
            const bTs = new Date(b.createdAt || 0).getTime();
            return aTs - bTs;
          });

        if (!isFirstSnapshot.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type !== "added") return;
            const incoming = change.doc.data() as PrivateMessage;
            if (incoming.receiverId !== currentUser.uid) return;
            if (incoming.senderId === currentUser.uid) return;

            showSuccess(
              "Nouveau message",
              `${incoming.senderName || "Un membre"} vous a ecrit`
            );
          });
        }

        isFirstSnapshot.current = false;
        setMessages(messagesList);
        setLoading(false);
      },
      (error: unknown) => {
        console.error("Erreur ecoute messages:", error);
        const firestoreError = error as { code?: string };
        if (firestoreError.code === "permission-denied") {
          showError(
            "Permissions Firestore",
            "Lecture refusee. Verifiez les regles Firestore et reconnectez-vous."
          );
        } else {
          showError(
            "Erreur",
            `Impossible de charger la messagerie (${firestoreError.code || "unknown"})`
          );
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, showError, showSuccess]);

  const selectedUser = users.find((user) => user.uid === selectedUserId) || null;

  const currentConversation = useMemo(() => {
    if (!currentUser || !selectedUserId) return [];
    return messages.filter(
      (message) =>
        message.participants.includes(currentUser.uid) &&
        message.participants.includes(selectedUserId)
    );
  }, [messages, currentUser, selectedUserId]);

  useEffect(() => {
    if (!db || !currentUser || !selectedUserId || currentConversation.length === 0) {
      return;
    }

    const unreadInConversation = currentConversation.filter(
      (message) => message.receiverId === currentUser.uid && !message.read
    );
    if (unreadInConversation.length === 0) return;

    void Promise.all(
      unreadInConversation.map((message) =>
        updateDoc(doc(db, "privateMessages", message.id), { read: true })
      )
    ).catch((error) => {
      console.error("Erreur marquage lu:", error);
    });
  }, [currentConversation, currentUser, selectedUserId]);

  const conversations = useMemo(() => {
    if (!currentUser) return [];

    const map = new Map<
      string,
      {
        lastMessage: PrivateMessage;
        unreadCount: number;
      }
    >();

    for (const message of messages) {
      const otherId =
        message.senderId === currentUser.uid ? message.receiverId : message.senderId;

      const currentValue = map.get(otherId);
      const currentUnread = currentValue?.unreadCount || 0;
      const nextUnread =
        message.receiverId === currentUser.uid && !message.read
          ? currentUnread + 1
          : currentUnread;

      if (
        !currentValue ||
        new Date(message.createdAt).getTime() >
          new Date(currentValue.lastMessage.createdAt).getTime()
      ) {
        map.set(otherId, { lastMessage: message, unreadCount: nextUnread });
      } else {
        map.set(otherId, { lastMessage: currentValue.lastMessage, unreadCount: nextUnread });
      }
    }

    return Array.from(map.entries()).map(([otherId, value]) => ({
      otherId,
      message: value.lastMessage,
      unreadCount: value.unreadCount,
    }));
  }, [messages, currentUser]);

  const filteredUsers = useMemo(() => {
    const queryTerm = searchTerm.trim().toLowerCase();
    if (!queryTerm) return users;
    return users.filter((user) => {
      const haystack = `${user.displayName} ${user.email}`.toLowerCase();
      return haystack.includes(queryTerm);
    });
  }, [users, searchTerm]);

  const selectedConversationMeta = useMemo(() => {
    if (!selectedUserId) return null;
    return conversations.find((item) => item.otherId === selectedUserId) || null;
  }, [conversations, selectedUserId]);

  const selectedUserInitial =
    selectedUser?.displayName?.[0]?.toUpperCase() ||
    selectedUser?.email?.[0]?.toUpperCase() ||
    "?";

  const handleSend = async () => {
    if (!db || !currentUser || !selectedUser) return;

    const text = messageText.trim();
    if (!text) {
      showError("Message vide", "Saisissez un message");
      return;
    }

    setSending(true);
    try {
      const participants = Array.from(
        new Set([currentUser.uid, selectedUser.uid].filter(Boolean))
      );

      if (participants.length !== 2) {
        showError(
          "Conversation invalide",
          "Impossible d'identifier correctement les participants."
        );
        return;
      }

      await addDoc(collection(db, "privateMessages"), {
        participants,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email || "Utilisateur",
        receiverId: selectedUser.uid,
        receiverName: selectedUser.displayName || selectedUser.email || "Utilisateur",
        text,
        read: false,
        createdAt: new Date().toISOString(),
      });

      setMessageText("");
      showSuccess("Message envoye", "Votre message a ete envoye");
    } catch (error: unknown) {
      console.error("Erreur envoi message:", error);
      const firestoreError = error as { code?: string; message?: string };
      if (firestoreError.code === "permission-denied") {
        showError(
          "Permissions Firestore",
          `L'envoi est bloque (${firestoreError.code}). Detail: ${firestoreError.message || "regle refusee"}.`
        );
      } else {
        showError(
          "Erreur",
          `Impossible d'envoyer le message (${firestoreError.code || "unknown"})`
        );
      }
    } finally {
      setSending(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7.5rem)] overflow-hidden rounded-2xl border bg-slate-50/70 p-2 md:p-4">
      <div className="grid h-full min-h-0 grid-cols-1 gap-3 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
        <aside className="flex min-h-0 flex-col rounded-xl border bg-white p-3">
          <div className="mb-4 flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Retour"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h1 className="text-lg font-semibold">Chat</h1>
          </div>

          <div className="mb-4 rounded-xl border bg-slate-50 p-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-700">
                {(currentUser.displayName?.[0] || currentUser.email?.[0] || "U").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {currentUser.displayName || "Utilisateur"}
                </p>
                <p className="text-xs text-emerald-600">Disponible</p>
              </div>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Rechercher"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredUsers.map((user) => {
              const conversation = conversations.find((item) => item.otherId === user.uid);
              const last = conversation?.message;
              const unread = conversation?.unreadCount || 0;
              return (
                <button
                  key={user.uid}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selectedUserId === user.uid
                      ? "border-emerald-200 bg-emerald-50"
                      : "bg-white hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedUserId(user.uid)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {(user.displayName?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{user.displayName}</p>
                        {unread > 0 && (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">
                            {unread > 9 ? "9+" : unread}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500">
                        {last?.text || "Aucun message"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-white">
          {!selectedUser ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <div>
                <h2 className="text-xl font-semibold">Selectionnez une conversation</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Choisissez un contact pour demarrer la discussion en temps reel.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {selectedUserInitial}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedUser.displayName}</p>
                    <p className="text-xs text-emerald-600">En ligne</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <button className="rounded-md p-2 transition hover:bg-slate-100" type="button">
                    <Users className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b px-4 py-2 text-sm">
                <button type="button" className="rounded-lg bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
                  Messages
                </button>
                <button type="button" className="rounded-lg px-3 py-1 text-slate-500">
                  Participants
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-100/50 px-4 py-4">
                {currentConversation.length === 0 ? (
                  <p className="rounded-xl border bg-white p-3 text-sm text-slate-500">
                    Aucun message. Lancez la conversation.
                  </p>
                ) : (
                  currentConversation.map((message) => {
                    const isMine = message.senderId === currentUser.uid;
                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            isMine
                              ? "bg-indigo-100 text-slate-800"
                              : "border bg-white text-slate-700"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t bg-white p-3">
                <div className="flex items-center gap-2 rounded-xl border bg-slate-50 p-2">
                  <Input
                    placeholder="Ecrire votre message..."
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                  />
                  <button type="button" className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <Button
                    type="button"
                    disabled={sending}
                    onClick={handleSend}
                    className="rounded-lg bg-emerald-500 px-3 text-white hover:bg-emerald-600"
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="flex min-h-0 flex-col rounded-xl border bg-white p-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Shared files</h2>
            <button
              type="button"
              className="rounded-md border p-1.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Panel"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {selectedUser ? (
              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-700">
                  {selectedUserInitial}
                </div>
                <p className="font-semibold">{selectedUser.displayName}</p>
                <p className="text-xs text-slate-500">{selectedUser.email || "Membre de la plateforme"}</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                  <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                  En ligne
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-500">
                Selectionnez une conversation pour voir les details.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border bg-emerald-50 p-3">
                <p className="text-xs text-slate-500">All files</p>
                <p className="mt-1 text-2xl font-semibold">{currentConversation.length}</p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <p className="text-xs text-slate-500">All links</p>
                <p className="mt-1 text-2xl font-semibold">
                  {currentConversation.filter((message) => message.text.includes("http")).length}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                File type
              </p>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2 text-sm">
                  <Files className="h-4 w-4 text-indigo-500" />
                  Documents
                </div>
                <span className="text-xs text-slate-500">126 files</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-emerald-500" />
                  Photos
                </div>
                <span className="text-xs text-slate-500">53 files</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-amber-500" />
                  Movies
                </div>
                <span className="text-xs text-slate-500">31 files</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="h-4 w-4 text-sky-500" />
                  Other
                </div>
                <span className="text-xs text-slate-500">
                  {selectedConversationMeta ? selectedConversationMeta.unreadCount : 0} pending
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
