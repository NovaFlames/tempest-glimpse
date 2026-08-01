import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Globe2,
  History,
  Loader2,
  Radar,
  Radio,
  Satellite,
  ShieldAlert,
} from "lucide-react";
import { runForecast } from "@/lib/forecast.functions";
import type { Forecast, Prediction } from "@/lib/forecast-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Risk Radar — AI Incident Forecasting Dashboard" },
      {
        name: "description",
        content:
          "AI-driven early-warning dashboard that matches live news signals against historical precursor patterns to forecast disasters, conflicts and crises.",
      },
      { property: "og:title", content: "Risk Radar — AI Incident Forecasting Dashboard" },
      {
        property: "og:description",
        content:
          "Match live news signals against decades of historical precursor patterns to forecast emerging global incidents.",
      },
    ],
  }),
  component: Dashboard,
});

const SEVERITY_LABEL = ["", "Minor", "Notable", "Serious", "Severe", "Catastrophic"];

function riskTone(p: Prediction) {
  const score = (p.probability / 100) * p.severity;
  if (score >= 3.2) return { color: "var(--critical)", label: "Critical" };
  if (score >= 2.2) return { color: "var(--elevated)", label: "Elevated" };
  if (score >= 1.2) return { color: "var(--moderate)", label: "Moderate" };
  return { color: "var(--low)", label: "Watch" };
}

function Meter({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

function PredictionCard({ p }: { p: Prediction }) {
  const tone = riskTone(p);
  return (
    <article className="panel group relative overflow-hidden p-5 transition-colors hover:border-primary/50">
      <div
        className="absolute inset-x-0 top-0 h-px opacity-70"
        style={{ backgroundColor: tone.color }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="label-mono rounded-full px-2 py-1"
          style={{ color: tone.color, backgroundColor: `color-mix(in oklch, ${tone.color} 15%, transparent)` }}
        >
          {tone.label}
        </span>
        <span className="label-mono rounded-full bg-secondary px-2 py-1 text-muted-foreground">
          {p.category}
        </span>
        <span className="label-mono ml-auto text-muted-foreground">{p.timeframe}</span>
      </div>

      <h3 className="mt-4 text-lg leading-snug font-semibold">{p.title}</h3>
      <p className="label-mono mt-1 flex items-center gap-1.5 text-muted-foreground">
        <Globe2 className="size-3" /> {p.region}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-mono text-muted-foreground">Likelihood</span>
            <span className="font-mono text-sm" style={{ color: tone.color }}>
              {p.probability}%
            </span>
          </div>
          <div className="mt-2">
            <Meter value={p.probability} color={tone.color} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-mono text-muted-foreground">Impact</span>
            <span className="font-mono text-sm" style={{ color: tone.color }}>
              {SEVERITY_LABEL[p.severity]}
            </span>
          </div>
          <div className="mt-2">
            <Meter value={p.severity * 20} color={tone.color} />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{p.rationale}</p>

      <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
        <div>
          <dt className="label-mono flex items-center gap-1.5 text-muted-foreground">
            <History className="size-3" /> Historical analogue
          </dt>
          <dd className="mt-1">{p.historicalAnalogue}</dd>
        </div>
        <div>
          <dt className="label-mono flex items-center gap-1.5 text-muted-foreground">
            <Radar className="size-3" /> Matched precursor pattern
          </dt>
          <dd className="mt-1">{p.matchedPattern}</dd>
        </div>
        {p.earlySignals.length > 0 && (
          <div>
            <dt className="label-mono flex items-center gap-1.5 text-muted-foreground">
              <Radio className="size-3" /> Signals detected in recent news
            </dt>
            <dd className="mt-1">
              <ul className="space-y-1">
                {p.earlySignals.map((s) => (
                  <li key={s} className="flex gap-2 text-muted-foreground">
                    <span style={{ color: tone.color }}>›</span>
                    {s}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {p.watchIndicators.length > 0 && (
          <div>
            <dt className="label-mono flex items-center gap-1.5 text-muted-foreground">
              <AlertTriangle className="size-3" /> Escalation indicators to watch
            </dt>
            <dd className="mt-1">
              <ul className="space-y-1">
                {p.watchIndicators.map((s) => (
                  <li key={s} className="flex gap-2 text-muted-foreground">
                    <span className="text-primary">›</span>
                    {s}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}

function Dashboard() {
  const [focus, setFocus] = useState("");
  const forecastFn = useServerFn(runForecast);

  const mutation = useMutation<Forecast, Error, void>({
    mutationFn: () =>
      forecastFn({
        data: {
          window,
          ...(country.trim() ? { country: country.trim() } : {}),
          ...(focus.trim() ? { focus: focus.trim() } : {}),
        },
      }),
  });

  const forecast = mutation.data;
  const busy = mutation.isPending;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-10">
      <header className="panel relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-x-0 top-0 h-px scanline" />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <p className="label-mono flex items-center gap-2 text-primary">
              <Satellite className="size-3.5" /> Pattern-matching early-warning system
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Risk Radar</h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              The model recalls precursor sequences that preceded major incidents of the last four
              decades — wars, coups, famines, quakes, industrial failures, outbreaks and financial
              crises — then scans live news feeds for the same signatures forming today.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <div>
              <label className="label-mono block text-muted-foreground" htmlFor="window">
                Prediction window
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {WINDOWS.map((w) => (
                  <button
                    key={w}
                    id={w === WINDOWS[0] ? "window" : undefined}
                    type="button"
                    onClick={() => setWindow(w)}
                    aria-pressed={window === w}
                    className={`label-mono rounded-md border px-2 py-2 transition-colors ${
                      window === w
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-input text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-mono block text-muted-foreground" htmlFor="country">
                Country / region
              </label>
              <input
                id="country"
                list="country-suggestions"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Leave blank for global"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
              />
              <datalist id="country-suggestions">
                {COUNTRY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="label-mono block text-muted-foreground" htmlFor="focus">
                Optional analyst focus
              </label>
              <input
                id="focus"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. energy infrastructure…"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
              />
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={busy}
              className="label-mono flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Analyzing signals…
                </>
              ) : (
                <>
                  <Radar className="size-4" /> Generate prediction
                </>
              )}
            </button>
            <p className="label-mono text-muted-foreground">
              Scans live headlines · takes 20-40s
            </p>
          </div>
        </div>
      </header>

      {mutation.isError && (
        <div className="panel mt-6 flex items-start gap-3 border-destructive/50 p-5">
          <ShieldAlert className="mt-0.5 size-5 text-destructive" />
          <div>
            <p className="font-semibold">Forecast run failed</p>
            <p className="mt-1 text-sm text-muted-foreground">{mutation.error.message}</p>
          </div>
        </div>
      )}

      {busy && (
        <div className="panel mt-6 space-y-3 p-6">
          {["Fetching live news feeds", "Extracting signal set", "Matching historical precursors", "Scoring likelihood"].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className="size-1.5 animate-pulse rounded-full bg-primary"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
                <span className="label-mono text-muted-foreground">{step}</span>
              </div>
            ),
          )}
        </div>
      )}

      {!forecast && !busy && !mutation.isError && (
        <div className="panel mt-6 flex flex-col items-center gap-3 p-14 text-center">
          <Activity className="size-8 text-primary" />
          <p className="label-mono text-muted-foreground">No forecast in memory</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Run the analysis to pull the last seven days of global reporting and project where
            historical patterns are repeating.
          </p>
        </div>
      )}

      {forecast && !busy && (
        <section className="mt-6 space-y-6">
          <div className="panel p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Headlines analyzed", value: String(forecast.headlinesAnalyzed) },
                { label: "Forecasts issued", value: String(forecast.predictions.length) },
                {
                  label: "Run timestamp (UTC)",
                  value: new Date(forecast.generatedAt).toUTCString().slice(5, 22),
                },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="label-mono text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 font-mono text-2xl text-primary">{stat.value}</p>
                </div>
              ))}
            </div>
            {forecast.globalOutlook && (
              <p className="mt-5 border-t border-border pt-5 text-sm text-muted-foreground">
                {forecast.globalOutlook}
              </p>
            )}
            {forecast.sourcesSampled.length > 0 && (
              <p className="label-mono mt-4 text-muted-foreground">
                Sources sampled: {forecast.sourcesSampled.join(" · ")}
              </p>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {forecast.predictions.map((p) => (
              <PredictionCard key={p.title} p={p} />
            ))}
          </div>
        </section>
      )}

      <footer className="label-mono mt-10 text-muted-foreground">
        Speculative model output — probabilistic pattern inference, not verified intelligence. Do
        not use for operational or safety decisions.
      </footer>
    </main>
  );
}
