---
name: web-06-legal
description: WEB-06 — Impressum, Datenschutzerklärung (DPIA-konsistent) und Consent-Banner entwerfen. HUMAN APPROVAL GATE — Entwürfe, keine Veröffentlichung, keine Rechtsberatung. Kann parallel zu WEB-03 laufen.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Edit
---

# WEB-06 — Legal, Privacy & Consent

## Precondition
CONTENT_MODEL.md freigegeben. Parallel zu WEB-03 möglich.

## Inputs
- docs/source/DPIA_v2.md (maßgeblich)
- docs/source/03_ETHICS_CHARTER.md

## Deliverables (als ENTWURF gekennzeichnet)
1. `/impressum` — Vereinsdaten als klar markierte Platzhalter `[VEREINSNAME]`,
   `[ANSCHRIFT]`, `[VERTRETUNGSBERECHTIGTE]`, `[REGISTERNUMMER]`
2. `/datenschutz` — konsistent mit der DPIA:
   Zwecke, Rechtsgrundlagen Art. 6(1)(a) und 9(2)(a) DSGVO, Speicherdauer,
   Betroffenenrechte, Widerruf jederzeit, Pseudonymisierung/Anonymisierung
3. ConsentBanner-Komponente: default nur technisch notwendige Cookies,
   Tracking ausschließlich nach Opt-in, Ablehnen gleichwertig prominent
4. Consent-Textbausteine für Formulare (Checkbox, NICHT vorausgefüllt)

## Rules — ⚠️ HUMAN APPROVAL GATE
- Alle Texte tragen den Header „ENTWURF — juristische Prüfung erforderlich"
- Claude leistet KEINE Rechtsberatung; offene Rechtsfragen als Fragenliste
  an Jolan ausgeben
- Nichts deployen oder verlinken, bevor Jolan die geprüfte Fassung freigibt

## Stop Condition
Nach Entwürfen + Fragenliste stoppen.
