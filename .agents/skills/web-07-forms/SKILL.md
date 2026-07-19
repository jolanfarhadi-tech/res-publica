---
name: web-07-forms
description: WEB-07 — RPCS-Bewerbungsformular mit DSGVO-Consent bauen (Motivation max. 300 Wörter, Track-Wahl, Verfügbarkeit). Voraussetzung: WEB-06-Entwürfe vorhanden.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(npm run *)
---

# WEB-07 — Formulare & Bewerbungsflow (RPCS)

## Precondition
WEB-06-Consent-Bausteine liegen vor (freigegeben oder als Entwurf markiert).

## Inputs
- docs/source/RPCS_PROGRAM.md (Bewerbungsanforderungen)
- docs/source/DPIA_v2.md

## Felder (exakt nach RPCS, keine zusätzlichen Datenfelder)
1. Name, Kontakt (E-Mail) — Datenminimierung: nur was für Rückmeldung nötig ist
2. Motivation, max. 300 Wörter (Client- UND serverseitig validiert)
3. Track-Wahl: Harm Explainer | AHIP Specialist | Codex Research |
   Trauma-Informed Facilitation
4. Bestätigung der Verfügbarkeit (1 Online-Session/Woche + alle 4 Präsenz-Hearings)
5. Consent-Checkbox (Art. 6(1)(a), nicht vorausgefüllt) + Hinweis auf Widerrufsrecht

## Technik-Rules
- Server Actions / serverseitige Validierung verpflichtend, kein Client-only
- Keine sensiblen Daten in localStorage/sessionStorage oder Analytics
- Übertragung nur via HTTPS; Spam-Schutz ohne Tracking (z. B. Honeypot)
- Erfolg-/Fehlerzustände in allen drei Sprachen, RTL-getestet

## Validation
- [ ] Testlauf mit Dummy-Daten dokumentiert
- [ ] Kein Feld über RPCS-Anforderung hinaus

## Stop Condition
Nach dokumentiertem Testlauf stoppen. Freigabe abwarten.
