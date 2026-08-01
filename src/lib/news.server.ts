export type Headline = {
  title: string;
  source: string;
  published: string;
  topic: string;
};

const FEEDS: { topic: string; query: string }[] = [
  { topic: "Armed conflict", query: "war OR military escalation OR border clash" },
  { topic: "Political instability", query: "coup OR protests OR government collapse" },
  { topic: "Natural hazard", query: "earthquake OR volcano OR cyclone OR flood warning" },
  { topic: "Climate & drought", query: "drought OR heatwave OR famine warning" },
  { topic: "Economic stress", query: "currency crisis OR default OR inflation surge" },
  { topic: "Health & biosecurity", query: "outbreak OR epidemic OR virus surveillance" },
  { topic: "Infrastructure & industry", query: "pipeline OR grid failure OR chemical plant OR dam" },
  { topic: "Cyber & security", query: "cyberattack OR critical infrastructure hack" },
];

function decode(input: string) {
  return input
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function parseItems(xml: string, topic: string, limit: number): Headline[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items.slice(0, limit).map((item) => {
    const title = decode(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "Untitled");
    const source = decode(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? "Unknown");
    const published = decode(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
    return { title, source, published, topic };
  });
}

export async function fetchRecentHeadlines(perFeed = 8): Promise<Headline[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async ({ topic, query }) => {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
        `${query} when:7d`,
      )}&hl=en-US&gl=US&ceid=US:en`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RiskRadar/1.0)" },
      });
      if (!response.ok) return [] as Headline[];
      return parseItems(await response.text(), topic, perFeed);
    }),
  );

  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
