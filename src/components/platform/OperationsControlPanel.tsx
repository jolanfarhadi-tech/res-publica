import { Button } from "@/components/ui/Button";
import { controlPanelGroups } from "@/data/control-panel";
import type { Locale } from "@/i18n/config";
import { controlPanelCopy } from "@/i18n/control-panel";

export function OperationsControlPanel({
  locale,
  assignedAreaCount,
  membershipApplicationCount,
  publishingScopeCount,
}: {
  locale: Locale;
  assignedAreaCount: number;
  membershipApplicationCount: number;
  publishingScopeCount: number;
}) {
  const copy = controlPanelCopy[locale];
  const metrics = [
    [copy.assignedAreas, assignedAreaCount],
    [copy.membershipQueue, membershipApplicationCount],
    [copy.publishingScopes, publishingScopeCount],
  ] as const;

  return (
    <section className="space-y-8" aria-labelledby="admin-control-panel-title">
      <div className="glass-panel rounded-3xl p-7 sm:p-9">
        <p className="civic-label">{copy.eyebrow}</p>
        <h2 id="admin-control-panel-title" className="mt-3 text-3xl sm:text-4xl">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">{copy.lede}</p>
        <dl className="mt-7 grid gap-3 sm:grid-cols-3">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-bg/70 p-5">
              <dt className="text-sm leading-relaxed text-muted">{label}</dt>
              <dd className="mt-2 text-3xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h2 className="text-3xl">{copy.siteOverviewTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">
          {copy.siteOverviewLede}
        </p>
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {controlPanelGroups.map((group) => (
            <section
              key={group.id}
              className="rounded-2xl border border-border bg-surface p-6"
              aria-labelledby={`control-panel-${group.id}`}
            >
              <h3 id={`control-panel-${group.id}`} className="text-2xl">
                {copy.groups[group.id]}
              </h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {group.sections.map((section) => (
                  <li
                    key={section.id}
                    className="flex min-h-28 flex-col items-start justify-between gap-4 rounded-xl border border-border bg-bg/60 p-4"
                  >
                    <span className="font-semibold">{copy.sections[section.id]}</span>
                    <Button href={`/${locale}${section.path}`} variant="ghost">
                      {copy.openPage}
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-border bg-surface p-6" aria-labelledby="control-panel-boundaries">
        <h2 id="control-panel-boundaries" className="text-2xl">{copy.boundariesTitle}</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          {copy.boundaries.map((boundary) => (
            <li key={boundary} className="border-s-2 border-accent ps-4">{boundary}</li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

