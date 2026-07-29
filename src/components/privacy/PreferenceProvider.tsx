"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Locale } from "@/i18n/config";
import { getExperienceCopy } from "@/i18n/experience";

type Preferences = {
  decided: boolean;
  functional: boolean;
  analytics: boolean;
  newsletter: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  largerText: boolean;
};

type PreferenceContextValue = {
  preferences: Preferences;
  update: (key: keyof Omit<Preferences, "decided">, value: boolean) => void;
  save: () => void;
  acceptAll: () => void;
  rejectOptional: () => void;
  openCenter: () => void;
  saved: boolean;
};

const STORAGE_KEY = "res-publica-preferences-v1";
const defaults: Preferences = {
  decided: false,
  functional: false,
  analytics: false,
  newsletter: false,
  reduceMotion: false,
  highContrast: false,
  largerText: false,
};

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

function applyAccessibility(preferences: Preferences) {
  const root = document.documentElement;
  root.dataset.motion = preferences.reduceMotion ? "reduced" : "system";
  root.dataset.contrast = preferences.highContrast ? "high" : "standard";
  root.dataset.text = preferences.largerText ? "large" : "standard";
}

export function PreferenceProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] = useState(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [centerOpen, setCenterOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Preferences>;
        const next = { ...defaults, ...parsed, decided: true };
        setPreferences(next);
        applyAccessibility(next);
      }
    } catch {
      // An unavailable local store must never block the website.
    } finally {
      setHydrated(true);
    }
  }, []);

  function persist(next: Preferences) {
    setPreferences(next);
    setSaved(true);
    applyAccessibility(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Preferences remain effective for the current page session.
    }
    window.setTimeout(() => setSaved(false), 2200);
  }

  const value = useMemo<PreferenceContextValue>(
    () => ({
      preferences,
      update: (key, enabled) => {
        setSaved(false);
        setPreferences((current) => {
          const next = { ...current, [key]: enabled };
          if (
            key === "reduceMotion" ||
            key === "highContrast" ||
            key === "largerText"
          ) {
            applyAccessibility(next);
          }
          return next;
        });
      },
      save: () => persist({ ...preferences, decided: true }),
      acceptAll: () =>
        persist({
          ...preferences,
          decided: true,
          functional: true,
          analytics: true,
          newsletter: true,
        }),
      rejectOptional: () =>
        persist({
          ...preferences,
          decided: true,
          functional: false,
          analytics: false,
          newsletter: false,
        }),
      openCenter: () => setCenterOpen(true),
      saved,
    }),
    [preferences, saved]
  );

  return (
    <PreferenceContext.Provider value={value}>
      {children}
      {hydrated && !preferences.decided && (
        <ConsentBanner locale={locale} onPreferences={() => setCenterOpen(true)} />
      )}
      <PreferenceDialog
        locale={locale}
        open={centerOpen}
        onClose={() => setCenterOpen(false)}
      />
    </PreferenceContext.Provider>
  );
}

export function usePreferences() {
  const value = useContext(PreferenceContext);
  if (!value) {
    throw new Error("usePreferences must be used inside PreferenceProvider");
  }
  return value;
}

export function PreferenceTrigger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { openCenter } = usePreferences();
  return (
    <button type="button" className={className} onClick={openCenter}>
      {children}
    </button>
  );
}

function ConsentBanner({
  locale,
  onPreferences,
}: {
  locale: Locale;
  onPreferences: () => void;
}) {
  const copy = getExperienceCopy(locale).privacy;
  const { acceptAll, rejectOptional } = usePreferences();

  return (
    <aside
      className="consent-banner glass-panel"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
    >
      <div>
        <p className="civic-label">{copy.preferences}</p>
        <h2 id="consent-title" className="mt-2 text-xl font-semibold">
          {copy.bannerTitle}
        </h2>
        <p id="consent-description" className="mt-2 max-w-2xl text-sm text-muted">
          {copy.bannerText}
        </p>
        <Link
          href={`/${locale}/datenschutz`}
          className="mt-3 inline-block text-sm font-medium text-accent underline decoration-accent/35 underline-offset-4"
        >
          {copy.legalLink}
        </Link>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <button type="button" className="button-secondary" onClick={rejectOptional}>
          {copy.rejectOptional}
        </button>
        <button type="button" className="button-secondary" onClick={onPreferences}>
          {copy.preferences}
        </button>
        <button type="button" className="button-secondary" onClick={acceptAll}>
          {copy.acceptAll}
        </button>
      </div>
    </aside>
  );
}

function PreferenceDialog({
  locale,
  open,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const copy = getExperienceCopy(locale).privacy;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="preference-dialog"
      aria-labelledby="preference-dialog-title"
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-6 border-b border-border px-5 py-5 sm:px-7">
        <div>
          <p className="civic-label">{copy.localTitle}</p>
          <h2 id="preference-dialog-title" className="mt-2 text-2xl font-semibold">
            {copy.title}
          </h2>
        </div>
        <button
          type="button"
          className="icon-button inline-grid"
          onClick={() => dialogRef.current?.close()}
          aria-label={getExperienceCopy(locale).common.close}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="max-h-[min(70vh,46rem)] overflow-y-auto px-5 py-6 sm:px-7">
        <PreferenceControls locale={locale} />
      </div>
    </dialog>
  );
}

export function PreferenceControls({ locale }: { locale: Locale }) {
  const copy = getExperienceCopy(locale).privacy;
  const { preferences, update, save, saved } = usePreferences();

  return (
    <div className="space-y-8">
      <div>
        <p className="max-w-2xl leading-relaxed text-muted">{copy.localText}</p>
        <div className="mt-5 divide-y divide-border border-y border-border">
          <PreferenceRow
            title={copy.necessary}
            text={copy.necessaryText}
            checked
            disabled
          />
          <PreferenceRow
            title={copy.functional}
            text={copy.functionalText}
            checked={preferences.functional}
            onChange={(value) => update("functional", value)}
          />
          <PreferenceRow
            title={copy.analytics}
            text={copy.analyticsText}
            checked={preferences.analytics}
            onChange={(value) => update("analytics", value)}
          />
          <PreferenceRow
            title={copy.newsletter}
            text={copy.newsletterText}
            checked={preferences.newsletter}
            onChange={(value) => update("newsletter", value)}
          />
        </div>
      </div>

      <fieldset>
        <legend className="font-serif text-2xl font-semibold">
          {copy.accessibilityTitle}
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <ToggleCard
            label={copy.reduceMotion}
            checked={preferences.reduceMotion}
            onChange={(value) => update("reduceMotion", value)}
          />
          <ToggleCard
            label={copy.highContrast}
            checked={preferences.highContrast}
            onChange={(value) => update("highContrast", value)}
          />
          <ToggleCard
            label={copy.largerText}
            checked={preferences.largerText}
            onChange={(value) => update("largerText", value)}
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" className="button-primary" onClick={save}>
          {copy.save}
        </button>
        <p role="status" aria-live="polite" className="text-sm text-verdigris">
          {saved ? copy.saved : ""}
        </p>
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  text,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className="grid cursor-pointer grid-cols-[1fr_auto] gap-5 py-5">
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="mt-1 block max-w-2xl text-sm leading-relaxed text-muted">
          {text}
        </span>
      </span>
      <input
        type="checkbox"
        className="preference-switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
    </label>
  );
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="toggle-card">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
