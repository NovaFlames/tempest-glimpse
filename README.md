# Sentinel AI

> AI-assisted early-warning intelligence for emerging global incidents.

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff4785?style=flat-square)](https://lovable.dev)
[![Repository](https://img.shields.io/badge/GitHub-NovaFlames%2Ftempest--glimpse-181717?style=flat-square&logo=github)](https://github.com/NovaFlames/tempest-glimpse)

Sentinel AI is an experimental forecasting platform that uses large language models to analyze historical and current news, identify patterns that have preceded major incidents, and surface potential emerging risks through an interactive dashboard.

> **Important:** Sentinel AI generates exploratory signals, not definitive predictions. It must not be used as the sole basis for emergency response, public policy, investment, safety, or other high-impact decisions.

## Overview

Major incidents are often preceded by combinations of signals that develop over time. Sentinel AI is designed to help researchers explore those signals by comparing current events with historical news patterns.

The project focuses on potential indicators related to:

- Natural disasters
- Geopolitical tensions and armed conflict
- Humanitarian crises
- Infrastructure and industrial failures
- Other large-scale man-made or environmental incidents

## Features

- **Historical pattern analysis** — Explore recurring signals in decades of historical news.
- **Current-event comparison** — Compare recent reporting with previously observed patterns.
- **LLM-assisted forecasting** — Generate research-oriented incident assessments on demand.
- **Interactive dashboard** — Review prediction results and supporting context in one place.
- **On-demand generation** — Trigger a new analysis with the prediction action in the dashboard.
- **Responsible-use framing** — Present outputs as signals for further investigation rather than certainty.

## How it works

At a high level, Sentinel AI follows this workflow:

1. **Collect** historical and recent news data.
2. **Extract** entities, themes, trends, and other relevant signals.
3. **Compare** current patterns with historical incidents and their precursors.
4. **Generate** an LLM-assisted assessment of possible emerging risks.
5. **Present** the result and its context in the dashboard.
6. **Review** the assessment alongside official sources and domain expertise.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- A recent browser supported by your local development environment

### Installation

```bash
git clone https://github.com/NovaFlames/tempest-glimpse.git
cd tempest-glimpse
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by the development server in your browser.

### Production build

```bash
npm run build
```

To preview the production build locally, run the preview script if it is available in `package.json`:

```bash
npm run preview
```

## Using the dashboard

1. Start the application locally.
2. Open the dashboard in your browser.
3. Review available trends and previous analysis.
4. Select the prediction action to request a new assessment.
5. Treat the result as a research lead and validate it against reliable, official sources.

## Project status

Sentinel AI is an active experimental project. The forecasting pipeline, data sources, model configuration, and dashboard capabilities may change as the project develops.

## Development

Before opening a pull request:

1. Create a feature branch.
2. Install dependencies with `npm install`.
3. Run the development server and verify the affected flows.
4. Run the project’s available checks, such as build, test, and lint commands.
5. Submit a focused pull request with a clear description of the change.

Example:

```bash
git checkout -b feature/describe-your-change
npm install
npm run dev
npm run build
git status
git commit -m "feat: describe your change"
git push origin feature/describe-your-change
```

## Built with Lovable

This project was created with [Lovable](https://lovable.dev). Continue development in the [Lovable editor](https://lovable.dev/projects/8f0ccdbd-2066-4ce2-9866-b9d3dbb9d30e).

Lovable keeps the project synchronized with this repository, allowing changes to be made either in the editor or through a local Git workflow.

## Responsible use

AI-generated forecasts can be incomplete, biased, outdated, or wrong. Historical correlation does not establish causation, and the absence of a detected signal does not mean an incident is unlikely.

Do not use Sentinel AI to:

- replace emergency alerts or official government guidance
- make decisions about the safety of individuals or communities
- make high-impact decisions about people or organizations
- infer certainty from a confidence score or generated narrative
- amplify unverified claims or unconfirmed breaking news

Always consult qualified experts, primary sources, and official authorities before acting on information related to safety or major incidents.

## Contributing

Issues and pull requests are welcome. When contributing, please include:

- a concise description of the problem or improvement
- steps to reproduce for bug reports
- relevant screenshots or sample output for UI changes
- tests or validation steps where applicable
- notes about changes to prompts, data sources, or model behavior

## License

This repository does not currently specify a license. Until a license is added, no permission is granted to use, modify, or redistribute the code beyond what is permitted by applicable law.

## Links

- [Lovable](https://lovable.dev)
- [Lovable project editor](https://lovable.dev/projects/8f0ccdbd-2066-4ce2-9866-b9d3dbb9d30e)
- [GitHub repository](https://github.com/NovaFlames/tempest-glimpse)
