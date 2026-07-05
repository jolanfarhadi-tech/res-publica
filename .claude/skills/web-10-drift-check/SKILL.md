---
name: web-10-drift-check
description: WEB-10 — Drift-Check. Prüft die gesamte Website gegen die Quelldokumente (Begriffe, Zahlen, Zero Gamification, Sprachäquivalenz) und erzeugt DRIFT_REPORT.md. Wiederkehrend nach jedem Content-Update ausführen.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write
---

# WEB-10 — Content QA & Drift Check

## Wann
Erstmals nach WEB-05 (alle Sprachen), danach nach jedem größeren Content-Update.

## Prüfschritte
1. **Begriff-Check** (Grep über content/ und src/):
   - „Reputation" darf NICHT vorkommen → muss „Trust" sein
   - „Score", „Ranking", „Badge", „Points", „Leaderboard" → Verstoß gegen
     Zero Gamification melden
   - „Responsibility Evidence" konsistent verwendet
2. **Fakten-Check**: Jede Zahl auf der Website (Teilnehmer, Sessions, Budgets,
   KPIs) gegen docs/source/ abgleichen. Abweichung = Drift.
3. **UI-Check**: Kein Element mit Wettbewerbs-/Gamification-Charakter
   (Fortschrittsbalken mit Rängen, Vergleiche zwischen Personen)
4. **Sprachäquivalenz**: de/en/fa inhaltlich gleichwertig? Fehlende oder
   veraltete Übersetzungen auflisten (via translationOf-Verknüpfung)
5. **Legal-Konsistenz**: Datenschutzseite noch deckungsgleich mit DPIA?

## Deliverable
`docs/website/DRIFT_REPORT.md` — Datum, geprüfte Version/Commit,
Findings mit Priorität (Blocker / Major / Minor), Fix-Empfehlungen.

## Rules
- NUR berichten, nicht still korrigieren. Fixes erst nach Freigabe durch Jolan.

## Stop Condition
Report vorlegen, offene Punkte als Checkliste. Stoppen.
