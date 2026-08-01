export type RiskCategory =
  | "Natural disaster"
  | "Armed conflict"
  | "Civil unrest"
  | "Economic crisis"
  | "Pandemic / health"
  | "Industrial / infrastructure"
  | "Cyber";

export type Prediction = {
  title: string;
  category: RiskCategory | string;
  region: string;
  probability: number;
  severity: number;
  timeframe: string;
  historicalAnalogue: string;
  matchedPattern: string;
  earlySignals: string[];
  watchIndicators: string[];
  rationale: string;
};

export type Forecast = {
  generatedAt: string;
  window: string;
  country: string;
  headlinesAnalyzed: number;
  sourcesSampled: string[];
  globalOutlook: string;
  predictions: Prediction[];
};
