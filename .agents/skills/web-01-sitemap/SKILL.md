---
name: web-01-sitemap
description: WEB-01 — Information Architecture & Sitemap (v2). Trilinguale Seitenstruktur inkl. Fellowship- und Ausstellungsseiten. Voraussetzung: WEB-00 freigegeben.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write
---

# WEB-01 — Information Architecture & Sitemap (v2)

## Precondition
`docs/website/WEB_SCOPE.md` freigegeben. Sonst STOPPEN.

## Inputs
- docs/website/WEB_SCOPE.md
- docs/source/projects/PROJECT_PROPOSAL.md
- docs/source/projects/LAB_SERIES_FELLOWSHIP.md
- docs/source/projects/AUSSTELLUNG_TRADITION_GEGENWART.md
- docs/source/core/VISION.md, MISSION.md

## Deliverable
`docs/website/SITEMAP.md` mit dieser Basisstruktur:
- `/` Startseite (Leitprinzip: Listen. Recognize. Take Responsibility. …)
- `/mission` Vision & Mission
- `/methode` HARM, AHIP, Structured Hearings — laienverständlich
- `/labs` Die 5 Innovationen (Biography Lab, Mapping Lab, Dashboard,
  Annexes, Civic Intelligence Lab) — je eine Unterseite
- `/fellowship` Responsibility Community Fellowship (Frankfurt): Ablauf,
  Community Days, Bewerbung → verlinkt WEB-07-Formular
- `/civic-school` RPCS: 4 Phasen, 4 Tracks, 5 Level, Bewerbung
- `/codex` Was der Harm Codex ist (nur Erklärung, KEINE Daten)
- `/kultur/ausstellung` „Zwischen Tradition und Gegenwart" (3 Künstler:innen,
  30 Werke, Programm über 3 Tage)
- `/mitmachen` Teilnahmewege (Audience → Witness → Contributor → Moderator → Leader)
- `/forschung` Partnerschaften, Research Topics Bank (Teaser)
- `/media` „Bodies Under Power" / YouTube
- `/ueber-uns` Verein, Team, Governance, Ethics Board
- `/kontakt`, `/datenschutz`, `/impressum`, `/ethik`

## Rules
- Max. 7 Hauptnavigationspunkte; Rest Footer/Sekundärnavigation
- Identische Struktur de/en/fa; lokalisierte Slugs dokumentieren
- Pro Seite: Zweck, Zielgruppe, Quelldokument(e), Priorität (P0/P1/P2)
- Fellowship & Ausstellung = P0 (aktive Outreach-Projekte bei der Stadt)

## Validation
- [ ] Jede Seite hat mindestens ein Quelldokument
- [ ] Keine Seite verletzt Out-of-Scope aus WEB-00

## Stop Condition
Nach SITEMAP.md stoppen. Freigabe abwarten.
