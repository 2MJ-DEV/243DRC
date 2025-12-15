import { db } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface GitHubStats {
  stars: number;
  forks: number;
  lastUpdated: string;
}

interface CachedStats extends GitHubStats {
  cachedAt: number;
}

const CACHE_TTL = 60 * 60 * 1000; // 1 heure en millisecondes

/**
 * Hash une URL de repo GitHub pour créer une clé de cache
 * Remplace les '/' par '__' pour éviter les problèmes avec les références Firestore
 * Firestore nécessite un nombre pair de segments dans les chemins de documents
 */
function hashRepoUrl(repoUrl: string): string {
  // Extraire owner/repo de l'URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return "";
  // Remplacer '/' par '__' pour créer un ID de document valide
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, "");
  return `${owner}__${repo}`;
}

/**
 * Récupère les stats GitHub depuis le cache ou l'API
 * @param repoUrl - L'URL du repository GitHub
 * @returns Les stats GitHub (stars, forks)
 */
export async function getCachedGitHubStats(
  repoUrl: string
): Promise<{ stars: number; forks: number } | null> {
  if (!db) return null;

  const cacheKey = hashRepoUrl(repoUrl);
  if (!cacheKey) return null;

  try {
    // Vérifier le cache dans Firestore
    const cacheDoc = await getDoc(doc(db, "githubStats", cacheKey));

    if (cacheDoc.exists()) {
      const cachedData = cacheDoc.data() as CachedStats;
      const cacheAge = Date.now() - cachedData.cachedAt;

      // Si le cache est encore valide, le retourner
      if (cacheAge < CACHE_TTL) {
        return {
          stars: cachedData.stars,
          forks: cachedData.forks,
        };
      }
    }

    // Si pas de cache ou cache expiré, faire l'appel API
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo.replace(/\.git$/, "")}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          // Optionnel: ajouter un token GitHub pour augmenter la limite
          // Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      // Si erreur 403/429, retourner le cache même expiré si disponible
      if (response.status === 403 || response.status === 429) {
        if (cacheDoc.exists()) {
          const cachedData = cacheDoc.data() as CachedStats;
          return {
            stars: cachedData.stars,
            forks: cachedData.forks,
          };
        }
      }
      return null;
    }

    const data = await response.json();
    const stats = {
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      lastUpdated: data.updated_at || new Date().toISOString(),
      cachedAt: Date.now(),
    };

    // Mettre en cache dans Firestore
    await setDoc(doc(db, "githubStats", cacheKey), stats);

    return {
      stars: stats.stars,
      forks: stats.forks,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des stats GitHub:", error);
    
    // En cas d'erreur, retourner le cache même expiré si disponible
    try {
      const cacheDoc = await getDoc(doc(db, "githubStats", cacheKey));
      if (cacheDoc.exists()) {
        const cachedData = cacheDoc.data() as CachedStats;
        return {
          stars: cachedData.stars,
          forks: cachedData.forks,
        };
      }
    } catch (cacheError) {
      // Ignorer les erreurs de cache
    }
    
    return null;
  }
}

/**
 * Récupère les stats GitHub pour plusieurs repos en batch
 * Limite le nombre d'appels parallèles pour éviter les limites de taux
 */
export async function getCachedGitHubStatsBatch(
  repoUrls: string[],
  batchSize: number = 5
): Promise<Map<string, { stars: number; forks: number } | null>> {
  const results = new Map<string, { stars: number; forks: number } | null>();

  // Traiter par batch pour éviter les limites de taux
  for (let i = 0; i < repoUrls.length; i += batchSize) {
    const batch = repoUrls.slice(i, i + batchSize);
    const batchPromises = batch.map(async (url) => {
      const stats = await getCachedGitHubStats(url);
      return { url, stats };
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ url, stats }) => {
      results.set(url, stats);
    });

    // Attendre un peu entre les batches pour éviter les limites de taux
    if (i + batchSize < repoUrls.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

