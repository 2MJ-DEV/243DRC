"use client";

import { useEffect, useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GitHubActivityProps {
  githubUrl?: string;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4 pour les niveaux de couleur
}

export default function GitHubActivity({ githubUrl }: GitHubActivityProps) {
  const [contributions, setContributions] = useState<ContributionDay[]>([]);
  const [totalContributions, setTotalContributions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("GitHubActivity - githubUrl:", githubUrl);
    
    if (!githubUrl) {
      console.log("GitHubActivity - Pas de lien GitHub fourni");
      setLoading(false);
      return;
    }

    const fetchGitHubActivity = async () => {
      try {
        // Extraire le username depuis l'URL GitHub
        // Supporte plusieurs formats : https://github.com/username, github.com/username, etc.
        const match = githubUrl.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)/);
        if (!match) {
          console.error("GitHubActivity - URL GitHub invalide:", githubUrl);
          setError("URL GitHub invalide");
          setLoading(false);
          return;
        }
        
        const username = match[1];
        console.log("GitHubActivity - Username extrait:", username);
        
        // Récupérer tous les événements publics (jusqu'à 300 pour avoir une bonne couverture)
        // L'API GitHub limite à 300 événements par requête
        const allEvents: any[] = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore && page <= 3) { // Limiter à 3 pages pour éviter trop d'appels
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
              setError("Impossible de charger l'activité GitHub");
            }
            setLoading(false);
            return;
          }

          const events = await response.json();
          if (events.length === 0) {
            hasMore = false;
          } else {
            allEvents.push(...events);
            page++;
            // Attendre un peu entre les requêtes pour éviter les limites de taux
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        // Calculer les contributions des 365 derniers jours
        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        const contributionsMap = new Map<string, number>();

        // Compter les événements par jour (PushEvent compte pour plusieurs contributions)
        allEvents.forEach((event: any) => {
          const eventDate = new Date(event.created_at);
          if (eventDate >= oneYearAgo) {
            const dateKey = eventDate.toISOString().split('T')[0];
            let contributionCount = 0;
            
            // Différents types d'événements comptent différemment
            switch (event.type) {
              case 'PushEvent':
                // Un push peut contenir plusieurs commits
                contributionCount = event.payload?.commits?.length || 1;
                break;
              case 'PullRequestEvent':
                // Les PR ouvertes/fermées comptent comme contributions
                if (event.payload?.action === 'opened' || event.payload?.action === 'closed') {
                  contributionCount = 1;
                }
                break;
              case 'IssuesEvent':
                // Les issues ouvertes/fermées comptent
                if (event.payload?.action === 'opened' || event.payload?.action === 'closed') {
                  contributionCount = 1;
                }
                break;
              case 'CreateEvent':
                // Création de repo/branche/tag
                contributionCount = 1;
                break;
              case 'DeleteEvent':
                // Suppression de branche/tag
                contributionCount = 1;
                break;
              case 'PullRequestReviewEvent':
                // Review de PR
                contributionCount = 1;
                break;
              default:
                contributionCount = 0;
            }
            
            if (contributionCount > 0) {
              contributionsMap.set(dateKey, (contributionsMap.get(dateKey) || 0) + contributionCount);
            }
          }
        });

        // Créer un tableau de tous les jours de l'année (53 semaines)
        const allDays: ContributionDay[] = [];
        const currentDate = new Date(oneYearAgo);
        
        // Ajuster au début de la semaine (lundi)
        const dayOfWeek = currentDate.getDay();
        const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        currentDate.setDate(diff);
        
        while (currentDate <= now) {
          const dateKey = currentDate.toISOString().split('T')[0];
          const count = contributionsMap.get(dateKey) || 0;
          
          allDays.push({
            date: dateKey,
            count,
            level: 0, // Sera calculé après
          });
          
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Calculer les niveaux basés sur la distribution des contributions
        const counts = Array.from(contributionsMap.values());
        if (counts.length > 0) {
          const maxCount = Math.max(...counts);
          const sortedCounts = [...counts].sort((a, b) => a - b);
          const percentiles = {
            p25: sortedCounts[Math.floor(sortedCounts.length * 0.25)] || 0,
            p50: sortedCounts[Math.floor(sortedCounts.length * 0.5)] || 0,
            p75: sortedCounts[Math.floor(sortedCounts.length * 0.75)] || 0,
          };

          allDays.forEach((day) => {
            if (day.count === 0) {
              day.level = 0;
            } else if (day.count <= percentiles.p25) {
              day.level = 1;
            } else if (day.count <= percentiles.p50) {
              day.level = 2;
            } else if (day.count <= percentiles.p75) {
              day.level = 3;
            } else {
              day.level = 4;
            }
          });
        }

        const total = Array.from(contributionsMap.values()).reduce((sum, count) => sum + count, 0);
        
        setContributions(allDays);
        setTotalContributions(total);
      } catch (err) {
        console.error("Erreur lors du chargement de l'activité GitHub:", err);
        setError("Erreur lors du chargement de l'activité");
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubActivity();
  }, [githubUrl]);

  if (!githubUrl) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activité GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            Activité GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            {githubUrl && (
              <p className="text-xs text-muted-foreground">
                URL: {githubUrl}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contributions.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activité GitHub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Aucune activité GitHub récente trouvée.
            </p>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Voir le profil GitHub
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grouper les contributions par semaine (53 semaines)
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < contributions.length; i += 7) {
    const week = contributions.slice(i, i + 7);
    // S'assurer que chaque semaine a 7 jours (remplir avec des jours vides si nécessaire)
    while (week.length < 7) {
      const lastDate = week.length > 0 ? new Date(week[week.length - 1].date) : new Date();
      lastDate.setDate(lastDate.getDate() + 1);
      week.push({
        date: lastDate.toISOString().split('T')[0],
        count: 0,
        level: 0,
      });
    }
    weeks.push(week);
  }

  // Obtenir les mois pour l'affichage (uniquement les premiers jours de chaque mois)
  const months: { name: string; position: number }[] = [];
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  let currentMonth = -1;
  
  contributions.forEach((day, index) => {
    const date = new Date(day.date);
    const month = date.getMonth();
    const dayOfMonth = date.getDate();
    
    // Ajouter le mois si c'est le début du mois et qu'on est au début d'une semaine
    if (month !== currentMonth && index % 7 === 0 && dayOfMonth <= 7) {
      months.push({
        name: monthNames[month],
        position: Math.floor(index / 7),
      });
      currentMonth = month;
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
            Activité GitHub
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {totalContributions} contribution{totalContributions > 1 ? "s" : ""} cette année
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Graphique de contributions */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-block min-w-full">
              {/* Labels des mois */}
              <div className="flex gap-1 mb-2 h-4 relative">
                {months.map((month, index) => {
                  const nextMonth = months[index + 1];
                  const width = nextMonth 
                    ? (nextMonth.position - month.position) * 14 
                    : (weeks.length - month.position) * 14;
                  
                  return (
                    <div
                      key={index}
                      className="text-xs text-muted-foreground"
                      style={{ minWidth: `${width}px` }}
                    >
                      {month.name}
                    </div>
                  );
                })}
              </div>

              {/* Grille de contributions */}
              <div className="flex gap-1">
                {/* Labels des jours de la semaine */}
                <div className="flex flex-col gap-1 mr-2">
                  <div className="h-3"></div>
                  <div className="text-xs text-muted-foreground h-3 leading-3">Lun</div>
                  <div className="text-xs text-muted-foreground h-3 leading-3"></div>
                  <div className="text-xs text-muted-foreground h-3 leading-3">Mer</div>
                  <div className="text-xs text-muted-foreground h-3 leading-3"></div>
                  <div className="text-xs text-muted-foreground h-3 leading-3">Ven</div>
                  <div className="text-xs text-muted-foreground h-3 leading-3"></div>
                </div>

                {/* Semaines */}
                <div className="flex gap-1 flex-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => {
                        const date = new Date(day.date);
                        const tooltip = day.count > 0 
                          ? `${day.count} contribution${day.count > 1 ? "s" : ""} le ${date.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                          : `Aucune contribution le ${date.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
                        
                        return (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`w-3 h-3 rounded-sm ${getColorClass(day.level)} transition-all hover:scale-125 hover:ring-2 hover:ring-primary/50 cursor-pointer`}
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

          {/* Légende */}
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <span>Moins</span>
            <div className="flex gap-0.5">
              <div className="w-3 h-3 rounded-sm bg-muted border border-border"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500/40 border border-green-500/50"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500/60 border border-green-500/70"></div>
              <div className="w-3 h-3 rounded-sm bg-green-500 border border-green-600"></div>
            </div>
            <span>Plus</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

