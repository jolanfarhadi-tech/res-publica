# Res Publica — Website (CLAUDE.md) · Version 2

Diese Datei ist das Projekt-Gedächtnis. Claude Code liest sie bei jedem Sessionstart.

## Was dieses Projekt ist

Offizielle Website von Res Publica e.V. (i.G.), Hermann-Brill-Straße 16,
60437 Frankfurt am Main — Kommunikations- und Rekrutierungsfläche.
Die Website ist NICHT die Plattform selbst: kein Codex-Datenzugang, keine
Hearings online, keine Verarbeitung von Teilnehmerdaten außer Bewerbungs-/
Kontaktformularen.

## Tech-Stack (fixiert — nicht ändern ohne ADR)

- Next.js 15 (App Router), TypeScript
- Tailwind CSS v4 (nur logical properties für RTL: `ms-`, `me-`, `ps-`, `pe-`)
- Framer Motion, MDX-Content
- Deployment: Vercel · CI: GitHub Actions
- Sprachen: `de` (primär), `en`, `fa` (RTL, Font Vazirmatn)

## Genehmigte Quelldokumente (einzige Wahrheitsquelle)

Alle Website-Inhalte müssen aus diesen Dokumenten stammen — nichts erfinden.
Fehlt eine Datei: STOPPEN und Jolan fragen.

### docs/source/core/ (aus Roadmap 2.0, Commands 1–10)
- 00_CONSTITUTION.md · 01_HARM_OPERATING_SYSTEM.md · 03_ETHICS_CHARTER.md
- VISION.md · MISSION.md
- (weitere entstehen durch die Roadmap-Commands)

### docs/source/projects/
- PROJECT_PROPOSAL.md            — Hauptproposal (AHIP, SMHC/Harm Codex, KPIs, Budget)
- RPCS_PROGRAM.md                — Civic School: 5 Level, 4 Phasen, 4 Tracks, Bewerbung
- LAB_SERIES_FELLOWSHIP.md       — 5 Innovationen + Responsibility Community Fellowship
                                   (40 Fellows, 22 Expert:innen, Frankfurt, Budget 4–40k €)
- EARLY_WARNING_PROPOSAL.md      — AI Early Warning (Narrative→Signal, Responsibility Briefs,
                                   rote Linien: kein Urteil, kein Personen-Scoring)
- AUSSTELLUNG_TRADITION_GEGENWART.md — Kunstausstellung (3 Künstler:innen, 30 Werke, 3 Tage)
- STADT_FRANKFURT_ANSCHREIBEN.md — Outreach an Dezernat Diversität (Ton-Referenz!)

### docs/source/legal/ (READ-ONLY, nie auf die Website kopieren)
- DPIA_v2.0.md · ETHICS_PROTOCOL.md
- MEMBERSHIP_AGREEMENT_v2.2.md (Annexe A–I) · AVV_DPA_PARTNERS.md
- LEGAL_COMPLIANCE_PACKAGE.md — enthält offene Findings F1–F6 (Gerichtsstand,
  DPO-Pflicht, e.V. i.G.); Website-Datenschutztexte müssen DPIA-konsistent sein.

## 🔒 Golden Rules (gelten immer)

1. Zero Gamification — keine Scores, Rankings, Badges für Personen. „Trust",
   nie „Reputation". Issue-Level-Metriken (Priority Matrix) sind erlaubt,
   Personen-Metriken verboten.
2. Nur genehmigte Quellen — keine erfundenen Zahlen, Namen, Partner. Zahlen
   (Budgets, Teilnehmerziele) nur nach explizitem Human Approval öffentlich.
3. Trilingual verpflichtend — jede Seite in de/en/fa; fa = RTL (`dir="rtl"`).
4. Trauma-informierte Sprache — sachlich, würdevoll, keine Sensationalisierung,
   keine realen Fallbeispiele, keine Triggerbilder. Ton-Referenz: das
   Stadt-Frankfurt-Anschreiben (professionell, warm, nicht aktivistisch).
5. DSGVO first — kein Tracking ohne Opt-in; Formulare nur mit explizitem
   Consent (Art. 6(1)(a)/9(2)(a)), Datenminimierung, Widerrufshinweis.
6. Architecture before code — WEB-00 bis WEB-02 erzeugen nur Dokumente.
7. Human Approval Gates — Rechtstexte (WEB-06), öffentliche Zahlen (WEB-05),
   Production-Deployments (WEB-09). Claude veröffentlicht niemals selbst.
8. Stop Condition — nach jedem WEB-Command STOPPEN, nie automatisch weiter.
9. Drift Prevention — Self-Review gegen Quelldokumente vor jedem Abschluss;
   Abweichungen melden, nicht still korrigieren.

## Workflow — 11 Skills als Slash-Commands

```
/web-00-scope
  └─→ /web-01-sitemap → /web-02-content-model
        ├─→ /web-03-design-system → /web-04-i18n → /web-05-core-pages
        │                                             └─→ /web-08-seo-a11y → /web-09-deploy
        └─→ /web-06-legal → /web-07-forms ─────────────┘
/web-10-drift-check: nach web-05, danach wiederkehrend
```

Ein Command startet nur, wenn seine Abhängigkeiten freigegeben sind.

## Projektstruktur

```
src/app/[locale]/...     # Locale-Routing de/en/fa
src/components/          # UI-Komponenten (RTL-fähig)
src/styles/tokens.css    # Design Tokens (WEB-03)
content/{de,en,fa}/      # MDX-Collections
docs/source/{core,projects,legal}/   # Quelldokumente (READ-ONLY)
docs/website/            # Von Claude erzeugte Architektur-Dokumente
```

## Konventionen

- Commits: Conventional Commits (feat:, fix:, docs:, content:)
- Kein `any`; Server Components als Default; PR nur mit grünem Lint+Typecheck+Build
- Antworten an Jolan auf Deutsch; Code, Dateinamen, Doku-Titel auf Englisch
