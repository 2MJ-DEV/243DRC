"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
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
  isOnline?: boolean;
  lastActiveAt?: unknown;
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

interface OpenGraphPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

function normalizeUrl(rawUrl: string): string {
  return rawUrl.replace(/[),.;!?]+$/, "");
}

function extractLinks(text: string): string[] {
  return (text.match(URL_REGEX) || []).map(normalizeUrl);
}

function renderMessageTextWithLinks(text: string): ReactNode[] {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return parts.map((part, index) => {
    if (!/^https?:\/\//i.test(part)) {
      return <span key={`txt-${index}`}>{part}</span>;
    }

    const cleanUrl = normalizeUrl(part);
    const trailing = part.slice(cleanUrl.length);

    return (
      <span key={`link-${index}`}>
        <a
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 underline decoration-emerald-400 underline-offset-2 hover:text-emerald-700"
        >
          {cleanUrl}
        </a>
        {trailing}
      </span>
    );
  });
}

function toMillis(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
  }
  if (typeof value === "object" && value !== null) {
    if ("toMillis" in value && typeof (value as { toMillis?: unknown }).toMillis === "function") {
      return ((value as { toMillis: () => number }).toMillis());
    }
    if ("seconds" in value && typeof (value as { seconds?: unknown }).seconds === "number") {
      return (value as { seconds: number }).seconds * 1000;
    }
  }
  return null;
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
  const [presenceNow, setPresenceNow] = useState(() => Date.now());
  const [linkPreviews, setLinkPreviews] = useState<Record<string, OpenGraphPreview | null>>({});
  const isFirstSnapshot = useRef(true);
  const requestedPreviewUrls = useRef(new Set<string>());

  useEffect(() => {
    const timerId = setInterval(() => {
      setPresenceNow(Date.now());
    }, 15_000);

    return () => clearInterval(timerId);
  }, []);

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
    if (!db || !currentUser) return;

    const usersQuery = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
      usersQuery,
      (usersSnapshot) => {
        const usersList = usersSnapshot.docs
          .map((userDoc) => {
            const data = userDoc.data();
            return {
              uid: userDoc.id,
              displayName: (data.displayName as string) || "Utilisateur",
              email: (data.email as string) || "",
              isOnline: Boolean(data.isOnline),
              lastActiveAt: data.lastActiveAt,
            };
          })
          .filter((user) => user.uid !== currentUser.uid);

        setUsers(usersList);
      },
      (error: unknown) => {
        console.error("Erreur chargement contacts:", error);
        const firestoreError = error as { code?: string };
        showError(
          "Erreur",
          `Impossible de charger les contacts (${firestoreError.code || "unknown"})`
        );
      }
    );

    return () => unsubscribe();
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
    const firestore = db;
    if (!firestore || !currentUser || !selectedUserId || currentConversation.length === 0) {
      return;
    }

    const unreadInConversation = currentConversation.filter(
      (message) => message.receiverId === currentUser.uid && !message.read
    );
    if (unreadInConversation.length === 0) return;

    void Promise.all(
      unreadInConversation.map((message) =>
        updateDoc(doc(firestore, "privateMessages", message.id), { read: true })
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

  const sharedStats = useMemo(() => {
    const documentExt = new Set([
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
      "csv",
      "zip",
      "rar",
      "7z",
    ]);
    const photoExt = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic"]);
    const movieExt = new Set(["mp4", "mov", "avi", "mkv", "webm", "m4v", "wmv"]);

    let documents = 0;
    let photos = 0;
    let movies = 0;
    let other = 0;
    let totalLinks = 0;

    for (const message of currentConversation) {
      const urls = extractLinks(message.text);
      totalLinks += urls.length;

      for (const rawUrl of urls) {
        const cleanUrl = rawUrl.replace(/[),.;!?]+$/, "");
        const extMatch = cleanUrl.toLowerCase().match(/\.([a-z0-9]+)(?:[?#]|$)/);
        const ext = extMatch?.[1];

        if (!ext) {
          other += 1;
          continue;
        }

        if (documentExt.has(ext)) {
          documents += 1;
        } else if (photoExt.has(ext)) {
          photos += 1;
        } else if (movieExt.has(ext)) {
          movies += 1;
        } else {
          other += 1;
        }
      }
    }

    return {
      documents,
      photos,
      movies,
      other,
      totalLinks,
      totalFiles: documents + photos + movies,
    };
  }, [currentConversation]);

  useEffect(() => {
    const uniqueLinks = Array.from(
      new Set(currentConversation.flatMap((message) => extractLinks(message.text)))
    );

    const linksToFetch = uniqueLinks.filter((url) => !requestedPreviewUrls.current.has(url));
    if (linksToFetch.length === 0) return;

    linksToFetch.forEach((url) => requestedPreviewUrls.current.add(url));

    void Promise.all(
      linksToFetch.map(async (url) => {
        try {
          const response = await fetch(`/api/opengraph?url=${encodeURIComponent(url)}`);
          if (!response.ok) return { url, preview: null as OpenGraphPreview | null };
          const preview = (await response.json()) as OpenGraphPreview;
          return { url, preview };
        } catch {
          return { url, preview: null as OpenGraphPreview | null };
        }
      })
    ).then((results) => {
      setLinkPreviews((previous) => {
        const next = { ...previous };
        results.forEach(({ url, preview }) => {
          next[url] = preview;
        });
        return next;
      });
    });
  }, [currentConversation]);

  const selectedUserInitial =
    selectedUser?.displayName?.[0]?.toUpperCase() ||
    selectedUser?.email?.[0]?.toUpperCase() ||
    "?";

  const selectedUserIsOnline = useMemo(() => {
    if (!selectedUser) return false;
    if (!selectedUser.isOnline) return false;

    const lastActiveAtMs = toMillis(selectedUser.lastActiveAt);
    if (!lastActiveAtMs) return selectedUser.isOnline;

    return presenceNow - lastActiveAtMs < 90_000;
  }, [presenceNow, selectedUser]);

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

          <div
            className="hide-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
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
                    <p className={`text-xs ${selectedUserIsOnline ? "text-emerald-600" : "text-slate-500"}`}>
                      {selectedUserIsOnline ? "En ligne" : "Hors ligne"}
                    </p>
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

              <div
                className="hide-scrollbar flex-1 space-y-3 overflow-y-auto bg-slate-100/50 px-4 py-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {currentConversation.length === 0 ? (
                  <p className="rounded-xl border bg-white p-3 text-sm text-slate-500">
                    Aucun message. Lancez la conversation.
                  </p>
                ) : (
                  currentConversation.map((message) => {
                    const isMine = message.senderId === currentUser.uid;
                    const messageLinks = Array.from(new Set(extractLinks(message.text)));
                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            isMine
                              ? "bg-indigo-100 text-slate-800"
                              : "border bg-white text-slate-700"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {renderMessageTextWithLinks(message.text)}
                          </p>

                          {messageLinks.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {messageLinks.map((url) => {
                                const preview = linkPreviews[url];
                                if (!preview) return null;

                                return (
                                  <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-lg border bg-white/80 p-2 hover:bg-white"
                                  >
                                    <div className="flex gap-2">
                                      {preview.image ? (
                                        <img
                                          src={preview.image}
                                          alt={preview.title || "Apercu du lien"}
                                          className="h-14 w-14 rounded-md object-cover"
                                        />
                                      ) : null}
                                      <div className="min-w-0">
                                        <p className="truncate text-xs font-semibold text-slate-800">
                                          {preview.title || url}
                                        </p>
                                        {preview.description ? (
                                          <p className="line-clamp-2 text-xs text-slate-500">
                                            {preview.description}
                                          </p>
                                        ) : null}
                                        <p className="truncate text-[11px] text-slate-400">
                                          {preview.siteName || new URL(url).hostname}
                                        </p>
                                      </div>
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          )}
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

          <div
            className="hide-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto pr-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {selectedUser ? (
              <div className="rounded-xl border bg-slate-50 p-4 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-700">
                  {selectedUserInitial}
                </div>
                <p className="font-semibold">{selectedUser.displayName}</p>
                <p className="text-xs text-slate-500">{selectedUser.email || "Membre de la plateforme"}</p>
                <div
                  className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                    selectedUserIsOnline
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Circle
                    className={`h-3 w-3 ${
                      selectedUserIsOnline
                        ? "fill-emerald-500 text-emerald-500"
                        : "fill-slate-400 text-slate-400"
                    }`}
                  />
                  {selectedUserIsOnline ? "En ligne" : "Hors ligne"}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-500">
                Selectionnez une conversation pour voir les details.
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border bg-emerald-50 p-3">
                <p className="text-xs text-slate-500">Tous les fichiers</p>
                <p className="mt-1 text-2xl font-semibold">{sharedStats.totalFiles}</p>
              </div>
              <div className="rounded-xl border bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Tous les liens</p>
                <p className="mt-1 text-2xl font-semibold">{sharedStats.totalLinks}</p>
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
                <span className="text-xs text-slate-500">{sharedStats.documents} fichiers</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2 text-sm">
                  <ImageIcon className="h-4 w-4 text-emerald-500" />
                  Photos
                </div>
                <span className="text-xs text-slate-500">{sharedStats.photos} fichiers</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-amber-500" />
                  Movies
                </div>
                <span className="text-xs text-slate-500">{sharedStats.movies} fichiers</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-2">
                <div className="flex items-center gap-2 text-sm">
                  <Link2 className="h-4 w-4 text-sky-500" />
                  Other
                </div>
                <span className="text-xs text-slate-500">{sharedStats.other} liens</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
