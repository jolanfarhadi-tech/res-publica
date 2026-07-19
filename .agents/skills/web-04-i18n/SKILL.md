---
name: web-04-i18n
description: WEB-04 — i18n- und RTL-Infrastruktur implementieren (Locale-Routing de/en/fa, dir=rtl für Persisch, hreflang, Fallback-Logik). Voraussetzung: WEB-03 freigegeben.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(npm run *), Bash(npx *)
---

# WEB-04 — i18n & RTL-Infrastruktur

## Precondition
DESIGN_SYSTEM.md + tokens.css freigegeben.

## Implementierung
- Locale-Routing: `src/app/[locale]/` mit Middleware + `generateStaticParams`
  für `de`, `en`, `fa`; `de` als Default
- `<html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'}>`
- Lokalisierte Metadata + hreflang-Alternates pro Seite
- UI-String-Dictionaries: `src/i18n/{de,en,fa}.ts`, typsicher
- Fallback-Logik: fehlende Übersetzung → sichtbarer Hinweis
  („Diese Seite ist noch nicht auf X verfügbar"), KEIN stiller Fallback
- LanguageSwitcher verlinkt immer auf die äquivalente Seite (`translationOf`)

## Validation
- [ ] `npm run build` grün
- [ ] Jede Route rendert in allen drei Locales
- [ ] fa: RTL-Layout visuell geprüft (Navigation, Formulare, Cards spiegeln korrekt)

## Stop Condition
Nach bestandenem i18n-Test stoppen. Freigabe abwarten.
