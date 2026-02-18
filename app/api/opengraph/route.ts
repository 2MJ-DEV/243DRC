import { NextRequest, NextResponse } from "next/server";

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local")
  );
}

function extractMetaContent(html: string, property: string): string | undefined {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return undefined;
}

function extractTitle(html: string): string | undefined {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch?.[1]?.trim();
}

function resolveMaybeRelativeUrl(sourceUrl: string, maybeRelative?: string): string | undefined {
  if (!maybeRelative) return undefined;
  try {
    return new URL(maybeRelative, sourceUrl).toString();
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol) || isBlockedHostname(parsedUrl.hostname)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; 243DRC-LinkPreview/1.0; +https://243drc.local)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch target URL" }, { status: 502 });
    }

    const html = await response.text();

    const title = extractMetaContent(html, "og:title") || extractTitle(html);
    const description =
      extractMetaContent(html, "og:description") || extractMetaContent(html, "description");
    const image = resolveMaybeRelativeUrl(
      parsedUrl.toString(),
      extractMetaContent(html, "og:image")
    );
    const siteName = extractMetaContent(html, "og:site_name") || parsedUrl.hostname;

    return NextResponse.json({
      url: parsedUrl.toString(),
      title,
      description,
      image,
      siteName,
    });
  } catch {
    return NextResponse.json({ error: "Unable to resolve metadata" }, { status: 500 });
  }
}

