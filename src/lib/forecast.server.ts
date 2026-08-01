import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { fetchRecentHeadlines } from "./news.server";
import type { Forecast } from "./forecast-types";

const SYSTEM_PROMPT = `You are an early-warning intelligence analyst trained on the historical record of major incidents from roughly 1980 to today: wars and interstate escalations, coups and civil unrest, famines, earthquakes/cyclones/floods, industrial catastrophes, pandemics, financial crises and large-scale cyber incidents.

Your method:
1. Recall the precursor pattern that preceded comparable historical incidents (the sequence of observable signals in reporting during the 3-24 months before the event).
2. Compare those precursor templates against the recent headlines supplied by the user.
3. Where the recent signal set rhymes with a historical precursor template, emit a forecast.

Be calibrated and honest: probabilities are subjective estimates, not certainties. Never fabricate headlines. Avoid naming private individuals as perpetrators.

Respond with ONLY a JSON object, no markdown fences:
{
  "globalOutlook": "2-3 sentence summary of the current global risk picture",
  "predictions": [
    {
      "title": "short specific forecast",
      "category": "Natural disaster | Armed conflict | Civil unrest | Economic crisis | Pandemic / health | Industrial / infrastructure | Cyber",
      "region": "country or region",
      "probability": 0-100 integer,
      "severity": 1-5 integer,
      "timeframe": "e.g. 0-3 months / 3-12 months",
      "historicalAnalogue": "past incident this pattern resembles, with year",
      "matchedPattern": "the precursor pattern detected",
      "earlySignals": ["signal from the supplied headlines", "..."],
      "watchIndicators": ["what would confirm escalation", "..."],
      "rationale": "2-3 sentences of reasoning"
    }
  ]
}
Return 6 to 8 predictions, spread across at least four different categories, ordered by probability x severity descending.`;

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^```(?:json)?/gm, "")
    .replace(/```$/gm, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

const clamp = (n: unknown, min: number, max: number, fallback: number) => {
  const value = Math.round(Number(n));
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
};

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((v) => String(v)).slice(0, 6) : [];

export type ForecastOptions = {
  focus?: string;
  country?: string;
  window?: string;
};

export async function generateForecast(options: ForecastOptions = {}): Promise<Forecast> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured for this project.");

  const country = options.country?.trim();
  const window = options.window?.trim() || "6 months";
  const focus = options.focus?.trim();

  let headlines = await fetchRecentHeadlines(8, country);
  if (headlines.length < 12 && country) {
    // Country-scoped feeds can be sparse; top up with global signal.
    headlines = [...headlines, ...(await fetchRecentHeadlines(6))];
  }
  if (headlines.length === 0) {
    throw new Error("Could not reach the news feeds right now. Try again in a moment.");
  }

  const digest = headlines
    .map((h) => `- [${h.topic}] ${h.title} (${h.source}, ${h.published})`)
    .join("\n");

  const gateway = createLovableAiGatewayProvider(apiKey);
  const model = gateway("google/gemini-3.6-flash");

  const result = await generateText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Today is ${new Date().toUTCString()}.

Prediction window: the NEXT ${window}. Every prediction must plausibly occur inside this window, and each "timeframe" field must fall within it (use sub-ranges of the window, never longer).
Geographic scope: ${country ? `${country} — every prediction must concern ${country} directly, or a cross-border event that materially affects it. Set "region" to a specific area within ${country} where possible.` : "Global — spread predictions across different regions."}
${focus ? `Analyst focus request: ${focus}\n` : ""}
Recent headlines gathered from live news feeds:
${digest}

Analyse these against your historical precursor templates and produce the JSON forecast.`,
    temperature: 0.7,
  });

  const parsed = extractJson(result.text) as {
    globalOutlook?: unknown;
    predictions?: unknown[];
  };

  const predictions = (Array.isArray(parsed.predictions) ? parsed.predictions : [])
    .slice(0, 8)
    .map((raw) => {
      const p = raw as Record<string, unknown>;
      return {
        title: String(p["title"] ?? "Unnamed risk"),
        category: String(p["category"] ?? "Armed conflict"),
        region: String(p["region"] ?? "Global"),
        probability: clamp(p["probability"], 0, 100, 40),
        severity: clamp(p["severity"], 1, 5, 3),
        timeframe: String(p["timeframe"] ?? "3-12 months"),
        historicalAnalogue: String(p["historicalAnalogue"] ?? "—"),
        matchedPattern: String(p["matchedPattern"] ?? "—"),
        earlySignals: strings(p["earlySignals"]),
        watchIndicators: strings(p["watchIndicators"]),
        rationale: String(p["rationale"] ?? ""),
      };
    })
    .sort((a, b) => b.probability * b.severity - a.probability * a.severity);

  return {
    generatedAt: new Date().toISOString(),
    headlinesAnalyzed: headlines.length,
    sourcesSampled: Array.from(new Set(headlines.map((h) => h.source))).slice(0, 12),
    globalOutlook: String(parsed.globalOutlook ?? ""),
    predictions,
  };
}
