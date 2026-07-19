---
name: web-02-content-model
description: WEB-02 — Content Model für MDX-Collections (pages, news, events, programs, faq) inkl. Frontmatter-Schema und Übersetzungsverknüpfung. Voraussetzung: WEB-01 freigegeben.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write
---

# WEB-02 — Content Model (MDX)

## Precondition
`docs/website/SITEMAP.md` freigegeben. Sonst STOPPEN.

## Deliverable
`docs/website/CONTENT_MODEL.md` mit:
- Collections: `pages`, `news`, `events` (Hearings/Kohorten-Termine), `programs`
  (RPCS-Kohorten), `faq`
- Pro Collection ein Frontmatter-Schema (TypeScript-Interface + Beispiel):
  `title`, `locale` ('de'|'en'|'fa'), `slug`, `publishedAt`, `translationOf`,
  `draft`, optional `summary`
- Verzeichnislayout: `content/{de,en,fa}/<collection>/...`
- Validierungsstrategie (z. B. Zod-Schema pro Collection)

## Rules
- Jeder Inhalt trägt `locale`; Übersetzungen über `translationOf` verknüpft
- Kein Feld, das Scores/Rankings abbilden könnte (Zero Gamification)
- Nur Dokument + Schemadateien-Entwurf; keine Seiten bauen

## Validation
- [ ] Jede Sitemap-Seite ist einer Collection zugeordnet
- [ ] Schema deckt RTL/fa ohne Sonderfälle ab

## Stop Condition
Nach CONTENT_MODEL.md stoppen. Freigabe abwarten.
