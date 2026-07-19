---
name: web-05-core-pages
description: WEB-05 — Kernseiten mit genehmigtem Inhalt bauen (Startseite, Mission, Methode/AHIP, Codex, Civic School, Mitmachen etc.). Drei Approval-Gates: de, dann en, dann fa. Voraussetzung: WEB-04 freigegeben.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(npm run *)
---

# WEB-05 — Core Pages (Inhalt + Umsetzung)

## Precondition
i18n-Infrastruktur (WEB-04) freigegeben.

## Ablauf (verbindlich)
1. Alle MDX-Inhalte + Pages zuerst auf **Deutsch** → STOPPEN → Freigabe
2. Nach Freigabe: **Englisch** → STOPPEN → Freigabe
3. Nach Freigabe: **Persisch (fa, RTL)** → STOPPEN → Freigabe

## Content-Rules
- Ton-Referenz für alle öffentlichen Texte: das Stadt-Frankfurt-Anschreiben
  (docs/source/projects/STADT_FRANKFURT_ANSCHREIBEN.md) — professionell,
  warm, brückenbauend, nicht aktivistisch.
- Fellowship-Seite: Kennzahlen aus LAB_SERIES_FELLOWSHIP.md (40 Fellows,
  22 Expert:innen, 5 Sitzungen, 2 Events, 6–8 Wochen — Dauer vor
  Veröffentlichung mit Jolan festzurren, Poster nennt 8–12 Wochen!).
- Ausstellungsseite: nur Fakten aus AUSSTELLUNG_TRADITION_GEGENWART.md;
  Künstlernamen erst nach Freigabe.
- Jede inhaltliche Aussage muss aus docs/source/ belegbar sein.
  Unsichere Stelle: als `<!-- TODO: Quelle klären -->` markieren und Jolan fragen.
- Zahlen (Teilnehmerziele, Budgets, KPIs) NUR nach explizitem Human Approval
  öffentlich nennen — vorher Liste der geplanten Zahlen vorlegen.
- HARM/AHIP: laienverständlich, aber die 8 Schritte nicht verwässern.
- Keine Namen Betroffener, keine realen Fallbeispiele, keine Triggerbilder.
- Begriffe: „Trust" (nie „Reputation"), „Responsibility Evidence", keine Scores.
- Trauma-informierter Ton: sachlich, würdevoll, keine Sensationalisierung.

## Validation (pro Sprache)
- [ ] Build grün, alle Seiten erreichbar
- [ ] Begriff-Check (Reputation/Score/Ranking/Badge kommt nirgends vor)
- [ ] Jede Seite gegen ihr Quelldokument gegengelesen

## Stop Condition
Nach jeder Sprache einzeln stoppen (3 Gates). Niemals alle drei am Stück.
