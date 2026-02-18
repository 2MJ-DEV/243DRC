"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  GitFork,
  Globe,
  Star,
  Users,
} from "lucide-react";

interface Contributor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
}

interface DetailedProject {
  id: string;
  title: string;
  description: string;
  repoUrl: string;
  technologies: string[];
  authorName: string;
  authorId?: string;
  stars?: number;
  forks?: number;
  demoUrl?: string;
  captures?: string[];
}

function normalizeCaptureUrls(value: unknown): string[] {
  const raw =
    Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(",")
        : [];

  return raw
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => /^https?:\/\//i.test(item));
}

function parseGithubRepo(url: string) {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

function decodeBase64Utf8(content: string) {
  try {
    const normalized = content.replace(/\n/g, "");
    return decodeURIComponent(escape(atob(normalized)));
  } catch {
    return "";
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeHtml(html: string) {
  if (typeof window === "undefined") return html;

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, "text/html");
  const blockedTags = ["script", "style", "iframe", "object", "embed"];
  blockedTags.forEach((tag) => {
    documentNode.querySelectorAll(tag).forEach((node) => node.remove());
  });

  documentNode.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const key = attribute.name.toLowerCase();
      const value = attribute.value.toLowerCase().trim();
      if (key.startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
      if ((key === "href" || key === "src") && value.startsWith("javascript:")) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  return documentNode.body.innerHTML;
}

async function renderMarkdown(markdown: string) {
  try {
    const response = await fetch("https://api.github.com/markdown", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        text: markdown,
        mode: "gfm",
      }),
    });

    if (!response.ok) {
      return `<pre>${escapeHtml(markdown)}</pre>`;
    }

    const html = await response.text();
    return sanitizeHtml(html);
  } catch {
    return `<pre>${escapeHtml(markdown)}</pre>`;
  }
}

async function fetchAllGithubContributors(owner: string, repo: string) {
  const all: Array<{
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
  }> = [];

  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=${perPage}&page=${page}`
    );
    if (!response.ok) break;

    const chunk = (await response.json()) as Array<{
      login: string;
      avatar_url: string;
      html_url: string;
      contributions: number;
    }>;

    if (chunk.length === 0) break;
    all.push(...chunk);

    if (chunk.length < perPage) break;
    page += 1;
  }

  return all;
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto w-[90vw] space-y-6 py-20">
      <div className="flex items-center justify-between gap-3">
        <SkeletonBlock className="h-10 w-28" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-10 w-24" />
          <SkeletonBlock className="h-10 w-24" />
        </div>
      </div>

      <Card className="overflow-hidden border-2">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <SkeletonBlock className="h-10 w-2/3" />
            <SkeletonBlock className="h-5 w-full" />
            <SkeletonBlock className="h-5 w-11/12" />
            <SkeletonBlock className="h-5 w-9/12" />
            <div className="flex flex-wrap gap-2">
              <SkeletonBlock className="h-8 w-24" />
              <SkeletonBlock className="h-8 w-28" />
              <SkeletonBlock className="h-8 w-20" />
            </div>
          </div>
          <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
            <SkeletonBlock className="h-16 w-full" />
            <div className="grid grid-cols-2 gap-2">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <SkeletonBlock className="h-8 w-36" />
            </CardHeader>
            <CardContent>
              <SkeletonBlock className="h-[420px] w-full" />
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-2">
              <SkeletonBlock className="h-8 w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <SkeletonBlock className="h-8 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <SkeletonBlock className="h-52 w-full" />
              <SkeletonBlock className="h-52 w-full" />
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-2">
              <SkeletonBlock className="h-8 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<DetailedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [readme, setReadme] = useState("");
  const [readmeHtml, setReadmeHtml] = useState("");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [demoUrl, setDemoUrl] = useState("");
  const [captures, setCaptures] = useState<string[]>([]);
  const [brokenCaptures, setBrokenCaptures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
      setNotFound(false);

      let foundProject: DetailedProject | null = null;

      if (db) {
        try {
          const snapshot = await getDoc(doc(db, "projects", projectId));
          if (snapshot.exists()) {
            const data = snapshot.data();
            foundProject = {
              id: snapshot.id,
              title: (data.title as string) || "Projet",
              description: (data.description as string) || "",
              repoUrl: (data.repoUrl as string) || "",
              technologies: (data.technologies as string[]) || [],
              authorName: (data.authorName as string) || "Auteur inconnu",
              authorId: data.authorId as string | undefined,
              stars: (data.stars as number) || 0,
              forks: (data.forks as number) || 0,
              demoUrl: data.demoUrl as string | undefined,
              captures: normalizeCaptureUrls(data.captures),
            };
          }
        } catch (error) {
          console.error("Erreur chargement projet Firestore:", error);
        }
      }

      if (!foundProject) {
        setProject(null);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProject(foundProject);
      setLoading(false);
    };

    void loadProject();
  }, [projectId]);

  useEffect(() => {
    const loadProjectExtras = async () => {
      if (!project) return;

      const github = parseGithubRepo(project.repoUrl || "");
      const fallbackReadme = `# ${project.title}\n\n${project.description || "Aucune description fournie."}`;

      if (!github) {
        const manualCaptures = normalizeCaptureUrls(project.captures);
        setReadme(fallbackReadme);
        setReadmeHtml(await renderMarkdown(fallbackReadme));
        setContributors(
          project.authorName
            ? [
                {
                  login: project.authorName,
                  avatarUrl: "",
                  profileUrl: project.authorId ? `/profil/${project.authorId}` : "#",
                  contributions: 1,
                },
              ]
            : []
        );
        setDemoUrl(project.demoUrl || "");
        setCaptures(manualCaptures);
        setBrokenCaptures({});
        return;
      }
      const manualCaptures = normalizeCaptureUrls(project.captures);

      try {
        const [repoResp, readmeResp] = await Promise.all([
          fetch(`https://api.github.com/repos/${github.owner}/${github.repo}`),
          fetch(`https://api.github.com/repos/${github.owner}/${github.repo}/readme`),
        ]);

        if (repoResp.ok) {
          const repoData = (await repoResp.json()) as {
            homepage?: string;
            owner?: { avatar_url?: string };
          };
          setDemoUrl(project.demoUrl || repoData.homepage || "");

          const fallbackCaptures = [
            `https://opengraph.githubassets.com/1/${github.owner}/${github.repo}`,
            `https://opengraph.githubassets.com/${Date.now()}/${github.owner}/${github.repo}`,
            `https://github.com/${github.owner}.png`,
            repoData.owner?.avatar_url || "",
          ].filter(Boolean);

          setCaptures(
            Array.from(new Set([...manualCaptures, ...fallbackCaptures]))
          );
          setBrokenCaptures({});
        } else {
          setDemoUrl(project.demoUrl || "");

          setCaptures(
            Array.from(
              new Set([
                ...manualCaptures,
                `https://opengraph.githubassets.com/1/${github.owner}/${github.repo}`,
                `https://github.com/${github.owner}.png`,
              ])
            )
          );
          setBrokenCaptures({});
        }

        if (readmeResp.ok) {
          const readmeData = (await readmeResp.json()) as { content?: string };
          const content = readmeData.content
            ? decodeBase64Utf8(readmeData.content)
            : fallbackReadme;
          const markdown = content || fallbackReadme;
          setReadme(markdown);
          setReadmeHtml(await renderMarkdown(markdown));
        } else {
          setReadme(fallbackReadme);
          setReadmeHtml(await renderMarkdown(fallbackReadme));
        }

        const contributorsData = await fetchAllGithubContributors(
          github.owner,
          github.repo
        );
        if (contributorsData.length === 0) {
          setContributors([]);
        } else {
          setContributors(
            contributorsData.map((item) => ({
              login: item.login,
              avatarUrl: item.avatar_url,
              profileUrl: item.html_url,
              contributions: item.contributions,
            }))
          );
        }
      } catch (error) {
        console.error("Erreur chargement extras GitHub:", error);
        setReadme(fallbackReadme);
        setReadmeHtml(await renderMarkdown(fallbackReadme));
        setContributors([]);
        setDemoUrl(project.demoUrl || "");
        setCaptures(
          Array.from(
            new Set([
              ...manualCaptures,
              `https://opengraph.githubassets.com/1/${github.owner}/${github.repo}`,
              `https://github.com/${github.owner}.png`,
            ])
          )
        );
        setBrokenCaptures({});
      }
    };

    void loadProjectExtras();
  }, [project]);

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-4xl py-16">
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <h1 className="text-2xl font-semibold">Projet introuvable</h1>
            <p className="text-muted-foreground">
              Ce projet n&apos;existe pas ou n&apos;est plus disponible.
            </p>
            <Button asChild variant="outline">
              <Link href="/explorer-les-projets">Retour a l&apos;exploration</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-[90vw] mx-auto space-y-6 py-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link href="/explorer-les-projets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          {demoUrl ? (
            <Button asChild variant="rdc">
              <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                Demo
              </a>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Depot
            </a>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-2">
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            <h1 className="block text-3xl font-bold leading-tight md:text-4xl">
              {project.title}
            </h1>
            <p className="max-w-4xl text-base leading-8 text-muted-foreground md:text-lg">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {(project.technologies || []).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border bg-background px-3 py-1 text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
            <div className="rounded-lg bg-background px-3 py-2 text-sm">
              <span className="text-muted-foreground">Auteur</span>
              <p className="font-semibold">{project.authorName}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">Stars</span>
                <p className="flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 text-amber-500" />
                  {project.stars || 0}
                </p>
              </div>
              <div className="rounded-lg bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">Forks</span>
                <p className="flex items-center gap-1 font-semibold">
                  <GitFork className="h-4 w-4 text-blue-500" />
                  {project.forks || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                README
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[560px] overflow-auto rounded-lg border bg-background p-4">
                <article
                  className="max-w-none text-sm leading-7 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_table]:block [&_table]:overflow-x-auto [&_table]:text-sm [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{
                    __html:
                      readmeHtml ||
                      `<pre>${escapeHtml(readme || "README indisponible.")}</pre>`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle>Captures</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {captures.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune capture disponible.
                </p>
              ) : captures.every((capture) => brokenCaptures[capture]) ? (
                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                  Impossible de charger un apercu visuel pour ce projet.
                </div>
              ) : (
                captures.map((capture, index) => {
                  const isBroken = brokenCaptures[capture];
                  return (
                    <div
                      key={`${capture}-${index}`}
                      className="relative h-52 overflow-hidden rounded-lg border bg-muted/30"
                    >
                      {isBroken ? (
                        <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                          Capture indisponible pour ce projet.
                        </div>
                      ) : (
                        <Image
                          src={capture}
                          alt={`Capture ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          onError={() =>
                            setBrokenCaptures((prev) => ({ ...prev, [capture]: true }))
                          }
                        />
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contributeurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contributors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucun contributeur charge.
                </p>
              ) : (
                <div className="flex max-h-[220px] w-full flex-col gap-2 overflow-y-auto">
                  {contributors.map((contributor, index) => (
                    <a
                      key={contributor.login}
                      href={contributor.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="relative flex-shrink-0">
                        {contributor.avatarUrl ? (
                          <Image
                            src={contributor.avatarUrl}
                            alt={contributor.login}
                            width={42}
                            height={42}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">
                            {contributor.login[0]?.toUpperCase() || "U"}
                          </div>
                        )}
                        {index < 3 ? (
                          <span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                            #{index + 1}
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{contributor.login}</p>
                        <p className="text-xs text-muted-foreground">
                          {contributor.contributions} contributions
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
