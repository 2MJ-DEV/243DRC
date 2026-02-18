"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GitHubActivityProps {
  githubUrl?: string;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubEvent {
  created_at: string;
  type: string;
  payload?: {
    commits?: unknown[];
    action?: string;
  };
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

function formatDateKeyLocal(input: Date): string {
  const year = input.getFullYear();
  const month = String(input.getMonth() + 1).padStart(2, "0");
  const day = String(input.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseGithubUsername(url: string): string | null {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s?#]+)/i);
  return match?.[1] || null;
}

export default function GitHubActivity({ githubUrl }: GitHubActivityProps) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!githubUrl) {
      setLoading(false);
      return;
    }

    const fetchGitHubActivity = async () => {
      try {
        const username = parseGithubUsername(githubUrl);
        if (!username) {
          setError("URL GitHub invalide");
          setLoading(false);
          return;
        }

        const allEvents: GitHubEvent[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore && page <= 3) {
          const response = await fetch(
            `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
              },
            }
          );

          if (!response.ok) {
            if (response.status === 404) {
              setError("Utilisateur GitHub introuvable");
            } else if (response.status === 403) {
              setError("Limite de taux GitHub atteinte");
            } else {
              setError("Impossible de charger l'activite GitHub");
            }
            setLoading(false);
            return;
          }

          const events = (await response.json()) as GitHubEvent[];
          if (events.length === 0) {
            hasMore = false;
          } else {
            allEvents.push(...events);
            page++;
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        }

        const now = new Date();
        const nowAtNoon = new Date(now);
        nowAtNoon.setHours(12, 0, 0, 0);

        const oneYearAgo = new Date(nowAtNoon);
        oneYearAgo.setDate(oneYearAgo.getDate() - 364);

        const startDate = new Date(oneYearAgo);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(12, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 53 * 7 - 1);
        endDate.setHours(12, 0, 0, 0);

        const contributionsMap = new Map<string, number>();

        allEvents.forEach((event) => {
          const eventDate = new Date(event.created_at);
          if (eventDate < oneYearAgo) return;

          const dateKey = formatDateKeyLocal(eventDate);
          let contributionCount = 0;

          switch (event.type) {
            case "PushEvent":
              contributionCount = event.payload?.commits?.length || 1;
              break;
            case "PullRequestEvent":
              if (event.payload?.action === "opened" || event.payload?.action === "closed") {
                contributionCount = 1;
              }
              break;
            case "IssuesEvent":
              if (event.payload?.action === "opened" || event.payload?.action === "closed") {
                contributionCount = 1;
              }
              break;
            case "CreateEvent":
            case "DeleteEvent":
            case "PullRequestReviewEvent":
              contributionCount = 1;
              break;
            default:
              contributionCount = 0;
          }

          if (contributionCount > 0) {
            contributionsMap.set(dateKey, (contributionsMap.get(dateKey) || 0) + contributionCount);
          }
        });

        const allDays: ContributionDay[] = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateKey = formatDateKeyLocal(currentDate);
          allDays.push({
            date: dateKey,
            count: contributionsMap.get(dateKey) || 0,
            level: 0,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        const counts = Array.from(contributionsMap.values());
        if (counts.length > 0) {
          const sorted = [...counts].sort((a, b) => a - b);
          const p25 = sorted[Math.floor(sorted.length * 0.25)] || 0;
          const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
          const p75 = sorted[Math.floor(sorted.length * 0.75)] || 0;

          allDays.forEach((day) => {
            if (day.count === 0) day.level = 0;
            else if (day.count <= p25) day.level = 1;
            else if (day.count <= p50) day.level = 2;
            else if (day.count <= p75) day.level = 3;
            else day.level = 4;
          });
        }

        const total = Array.from(contributionsMap.values()).reduce((sum, count) => sum + count, 0);
        setContributions(allDays);
        setTotalContributions(total);
      } catch (err) {
        console.error("Erreur lors du chargement de l'activite GitHub:", err);
        setError("Erreur lors du chargement de l'activite");
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubActivity();
  }, [githubUrl]);

  if (!githubUrl) return null;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activite GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activite GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center">
            <p className="mb-2 text-sm text-muted-foreground">{error}</p>
            {githubUrl && <p className="text-xs text-muted-foreground">URL: {githubUrl}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  const months: { name: string; position: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (month !== lastMonth) {
      months.push({ name: MONTH_NAMES[month], position: weekIndex });
      lastMonth = month;
    }
  });

  const getColorClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted border border-border";
      case 1:
        return "bg-green-500/20 border border-green-500/30";
      case 2:
        return "bg-green-500/40 border border-green-500/50";
      case 3:
        return "bg-green-500/60 border border-green-500/70";
      case 4:
        return "bg-green-500 border border-green-600";
      default:
        return "bg-muted border border-border";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activite GitHub
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {totalContributions} contribution{totalContributions > 1 ? "s" : ""} cette annee
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="overflow-x-auto pb-2">
            <div className="inline-block min-w-[860px]">
              <div className="mb-2 flex h-4 gap-1">
                {months.map((month, index) => {
                  const nextMonth = months[index + 1];
                  const width = nextMonth ? (nextMonth.position - month.position) * 14 : (weeks.length - month.position) * 14;
                  return (
                    <div key={`${month.name}-${month.position}`} className="text-xs text-muted-foreground" style={{ minWidth: `${width}px` }}>
                      {month.name}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-1">
                <div className="mr-2 flex flex-col gap-1">
                  <div className="h-3" />
                  <div className="h-3 text-xs leading-3 text-muted-foreground">Lun</div>
                  <div className="h-3 text-xs leading-3 text-muted-foreground" />
                  <div className="h-3 text-xs leading-3 text-muted-foreground">Mer</div>
                  <div className="h-3 text-xs leading-3 text-muted-foreground" />
                  <div className="h-3 text-xs leading-3 text-muted-foreground">Ven</div>
                  <div className="h-3 text-xs leading-3 text-muted-foreground" />
                </div>

                <div className="flex gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => {
                        const date = new Date(day.date);
                        const tooltip =
                          day.count > 0
                            ? `${day.count} contribution${day.count > 1 ? "s" : ""} le ${date.toLocaleDateString("fr-FR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}`
                            : `Aucune contribution le ${date.toLocaleDateString("fr-FR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}`;

                        return (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`h-3 w-3 cursor-pointer rounded-sm transition-all hover:scale-125 hover:ring-2 hover:ring-primary/50 ${getColorClass(
                              day.level
                            )}`}
                            title={tooltip}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Moins</span>
            <div className="flex gap-0.5">
              <div className="h-3 w-3 rounded-sm border border-border bg-muted" />
              <div className="h-3 w-3 rounded-sm border border-green-500/30 bg-green-500/20" />
              <div className="h-3 w-3 rounded-sm border border-green-500/50 bg-green-500/40" />
              <div className="h-3 w-3 rounded-sm border border-green-500/70 bg-green-500/60" />
              <div className="h-3 w-3 rounded-sm border border-green-600 bg-green-500" />
            </div>
            <span>Plus</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
