---
name: web-03-design-system
description: WEB-03 — Design System, Tokens und Komponentenliste für die Res-Publica-Website. Seriös-institutionelle Ästhetik, WCAG AA, RTL-fähig. Voraussetzung: WEB-02 freigegeben.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Edit
---

# WEB-03 — Design System

## Precondition
CONTENT_MODEL.md freigegeben. Kann parallel zu WEB-06 laufen.

## Deliverables
1. `docs/website/DESIGN_SYSTEM.md`
2. `src/styles/tokens.css` (CSS Custom Properties, Tailwind-v4-@theme)

## Vorgaben
- Tonalität aus der Constitution: seriös, institutionell, ruhig.
  KEINE Alarm-Ästhetik, kein Aktivismus-Rot als Primärfarbe, keine Triggerbilder.
- Typografie: lateinische Schrift + Persisch (Vazirmatn für fa), Fluid Type Scale
- Farbpalette mit dokumentierten Kontrastwerten (WCAG 2.1 AA, Ziel AAA für Fließtext)
- Komponentenliste mit Zuständen: Header, Footer, Card, CTA-Button,
  LanguageSwitcher, ConsentBanner, FormField, Alert/Notice
- Alle Komponenten RTL-fähig: nur logical properties (`ms-`, `me-`, `ps-`, `pe-`,
  `text-start/end`), niemals `ml-`/`mr-`/`pl-`/`pr-`

## Validation
- [ ] Jede Farbe hat einen geprüften Kontrastwert
- [ ] Kein Token/Komponente impliziert Gamification (keine Badges, Progress-Ranks)

## Stop Condition
Nach Token-Datei + Dokument stoppen. Freigabe abwarten.
