---
name: web-08-seo-a11y
description: WEB-08 — SEO, strukturierte Daten und Accessibility-Audit (Ziel Lighthouse a11y ≥ 95, WCAG 2.1 AA, RTL-Screenreader-Test). Voraussetzung: WEB-05 de-Version freigegeben.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(npm run *), Bash(npx *)
---

# WEB-08 — SEO, Accessibility & Metadata

## Precondition
Mindestens die deutsche Version der Kernseiten (WEB-05) ist freigegeben.

## Deliverables
1. Metadata API pro Seite/Sprache: title, description, OpenGraph, hreflang-Alternates
2. Strukturierte Daten (JSON-LD): `Organization` (Verein),
   `EducationalOrganization` + `Course` (RPCS), `Event` (Kohorten-Termine)
3. `sitemap.xml` (alle Locales) + `robots.txt`
4. Accessibility-Audit-Report `docs/website/A11Y_AUDIT.md`:
   Tastaturnavigation, Fokus-Zustände, ARIA-Labels, Formular-Fehlermeldungen,
   Farbkontraste, RTL-Screenreader-Verhalten (fa)

## Rules
- Keine SEO-Übertreibungen: Descriptions nur aus genehmigten Inhalten
- Keine Tracking-basierten SEO-Tools einbinden

## Validation
- [ ] Lighthouse Accessibility ≥ 95 auf allen Kernseiten (Ergebnis dokumentieren)
- [ ] hreflang-Matrix vollständig (de/en/fa + x-default)

## Stop Condition
Nach Audit-Report stoppen. Offene Punkte als priorisierte Checkliste.
