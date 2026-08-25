import type { Locale } from "@/i18n/config";
import { team, teamSectionCopy } from "@/data/team";
import { Container } from "@/components/ui/Container";
import { PersonCard } from "@/components/ui/PersonCard";
import { JsonLd } from "@/components/seo/JsonLd";

export function TeamSection({ locale }: { locale: Locale }) {
  const copy = teamSectionCopy[locale];

  return (
    <section className="section-shell border-t border-border" aria-labelledby="team-heading">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: team.map((member, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Person",
              name: member.name,
              jobTitle: member.role[locale],
              worksFor: { "@type": "Organization", name: "Res Publica e.V." },
            },
          })),
        }}
      />
      <Container>
        <div className="max-w-3xl">
          <p className="civic-label">Res Publica e.V.</p>
          <h2 id="team-heading" className="mt-4 text-4xl sm:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">{copy.lede}</p>
        </div>

        <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <li key={member.id}>
              <PersonCard
                name={member.name}
                role={member.role[locale]}
                bio={member.bio?.[locale]}
              />
            </li>
          ))}
        </ul>

        <div className="glass-panel mt-10 max-w-4xl rounded-3xl p-7 sm:p-9">
          <h3 className="text-2xl">{copy.responsibilityTitle}</h3>
          <ul className="mt-5 space-y-3 ps-5 text-muted">
            {copy.responsibilities.map((responsibility) => (
              <li key={responsibility} className="list-disc leading-relaxed">
                {responsibility}
              </li>
            ))}
          </ul>
          <a
            href="/documents/satzung-res-publica-ev.docx"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            {copy.source}
          </a>
        </div>
      </Container>
    </section>
  );
}
