---
name: web-09-deploy
description: WEB-09 — CI (GitHub Actions), Performance-Budget und Vercel-Deployment vorbereiten. HUMAN APPROVAL GATE vor Production. Voraussetzung: WEB-08 abgeschlossen.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(npm run *), Bash(npx *), Bash(git *)
---

# WEB-09 — Performance, CI & Deployment

## Precondition
WEB-08-Audit abgeschlossen, kritische Punkte behoben.

## Deliverables
1. `.github/workflows/ci.yml`: Lint → Typecheck → Build → Link-Check pro PR
2. Vercel-Konfiguration: Preview für PRs, Production nur von `main`
3. Performance-Maßnahmen:
   - `next/image` für alle Bilder, moderne Formate
   - Font-Subsetting, besonders für persische Fonts (Vazirmatn)
   - Core Web Vitals Budget: LCP < 2,5 s · CLS < 0,1 · INP < 200 ms
4. `docs/website/DEPLOY_CHECKLIST.md`

## Rules — ⚠️ HUMAN APPROVAL GATE
- Codex deployt NIEMALS selbst nach Production.
- Vorgehen: Preview-Deployment vorbereiten → Checkliste vorlegen →
  Jolan gibt Production frei.

## Validation
- [ ] CI grün auf einem Test-PR
- [ ] Preview-URL funktioniert in allen drei Sprachen

## Stop Condition
Nach grünem CI + Preview stoppen. Production-Freigabe abwarten.
