---
name: web-00-scope
description: WEB-00 — Website Scope & Constitution Alignment. Definiert, was die Res-Publica-Website ist und was nicht. Erster Command, muss vor allen anderen laufen.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write
---

# WEB-00 — Website Scope & Constitution Alignment

## Purpose
Festlegen, was die Website ist und was nicht, bevor irgendetwas gebaut wird.

## Inputs (zuerst vollständig lesen)
- docs/source/00_CONSTITUTION.md
- docs/source/VISION.md
- docs/source/MISSION.md

Fehlt eine Datei: STOPPEN und Jolan fragen.

## Rules
- Die Website ist Kommunikations- und Rekrutierungsfläche — NICHT die Plattform.
- Out of Scope (verbindlich): Codex-Datenzugang, Online-Hearings, Mitgliederbereiche,
  jede Funktion aus Roadmap Phase 2–5.
- Nur Dokument erzeugen, keinen Code.

## Deliverable
`docs/website/WEB_SCOPE.md` mit:
1. In-Scope-Liste / Out-of-Scope-Liste
2. Zielgruppen: Teilnehmende, Förderer, Forschende, Medien
3. Erfolgskriterien der Website (qualitativ, keine Gamification-Metriken)
4. Abhängigkeitserklärung zu Commands 1, 2, 4, 6, 7, 9 und DPIA

## Validation (Self-Review vor Abschluss)
- [ ] Kein Feature im Scope greift einem Phase-2–5-Command vor
- [ ] Alle Aussagen aus den drei Quelldokumenten belegbar
- [ ] Zero-Gamification-Check bestanden

## Stop Condition
Nach Erstellung von WEB_SCOPE.md stoppen. Freigabe durch Jolan abwarten.
NICHT automatisch mit /web-01-sitemap fortfahren.
