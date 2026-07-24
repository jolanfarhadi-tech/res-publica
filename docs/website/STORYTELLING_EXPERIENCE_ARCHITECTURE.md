# Storytelling, Experience, and Symbolic Architecture

**Status:** Implemented non-ADR public-experience architecture

**Last updated:** 2026-07-24

**Scope:** Public website narrative, information hierarchy, symbolic language, product presentation, accessibility, and provenance safeguards

## 1. Authority and source status

This document is not an ADR. It does not redefine constitutional domains,
authorization, persistence, audit, governance, or runtime boundaries.

Its source hierarchy is:

1. **Canonical:** `brain/00_constitution/00_constitution.md`,
   `docs/source/foundation/00_MANIFESTO.md`, the remaining canonical
   foundation, methodology, academy, project, and communication sources, and
   accepted ADRs for governed architecture.
2. **Verified implementation:** current routes, APIs, domain code, tests,
   migrations, and the stable Publishing Authority backend at `09c160b`.
3. **Editorial synthesis:** the two connected human and institutional paths,
   WHY / HOW / WHAT / JOIN page hierarchy, and trust/fellowship narrative.
4. **Approved proposal:** the restrained star-to-constellation public metaphor.
5. **Unverified / excluded:** placeholder identities, partnerships, statistics,
   impact claims, production claims, and MDX without explicit provenance.
6. **Not recoverable:** any earlier full Experience Blueprint not present in
   the repository.

## 2. Central proposition

**Res Publica connects lived experience with accountable institutional action,
so isolated experience can become shared civic capacity and responsibility can
become repair.**

This proposition integrates philosophy, dignity, narrative, listening, civic
fellowship, HARM, responsibility, trust, research, publication, participation,
and institution-building. Technology remains backstage.

## 3. Two connected paths

Human path:

> lived experience → being heard → meaning → agency

Institutional path:

> documentation → evidence → responsibility → repair

Neither path stands alone. The human path preserves dignity and supports
participation. The institutional path preserves records, tests evidence, makes
authority answerable, and enables learning and repair.

## 4. Architectural views that must remain distinct

### Constitutional architecture

- Civic Domain
- Governance Domain
- Shared Platform Services

These boundaries remain governed by the Constitution and accepted ADRs.

### Technical and delivery architecture

- Core Platform
- Website & CMS
- implemented application modules

This is an implementation view, not the website navigation or product story.

### Internal support

- AI Layer
- Executive AI Office

These support governed work internally. They are not public products and are
not presented as the main proposition.

### Non-ADR public-experience layers

- **Experience Layer:** sequence, audience journeys, interaction, accessibility
- **Narrative Layer:** proposition, WHY / HOW / WHAT / JOIN, page hierarchy
- **Symbolic Layer:** star, relationship lines, constellation, orientation

### Public information architecture

- **WHY:** homepage, Mission & Vision, About
- **HOW:** Method
- **WHAT:** Offerings, Practice, Research, Publications, Events
- **JOIN:** Membership, Member Profile, Contact

The information architecture represents the ecosystem without redefining it.

## 5. Multi-platform ecosystem representation

The public website uses a relationship view rather than a flat platform
inventory.

| Best-supported layer | Public role | Website expression | Governance status |
| --- | --- | --- | --- |
| Civic platform capabilities | participation, community, membership, events | JOIN and selected WHAT pages | ADR/domain governed |
| HARM platform capabilities | listening, documentation, responsibility, learning | Method | ADR/domain governed where implemented; methodology is canonical documentation |
| Governance platform capabilities | bounded authority, review, answerability | trust narrative and safeguards | ADR/Constitution governed |
| RPCS / Civic School | civic learning programme | Offering marked documented/in development | canonical programme documentation |
| Experience Layer | coherent and accessible user journey | all public pages | non-ADR |
| Narrative Layer | public meaning and editorial sequence | WHY / HOW / WHAT / JOIN | non-ADR |
| Symbolic Layer | dignity and relational orientation | homepage constellation | non-ADR |
| Shared Platform Services | identity, persistence, audit, runtime support | not marketed; visible only through safe behavior | ADR governed |
| AI Layer | bounded assistance | described only as limited assistance | internal, ADR governed |
| Executive AI Office | internal coordination and review support | not a public offering | internal, ADR governed |

Products are not platforms. Methodologies are not operational products.
Internal infrastructure is not marketed as an offering.

## 6. Homepage sequence

The homepage carries the complete primary narrative:

1. central proposition;
2. the dignity of an isolated experience;
3. human movement;
4. institutional movement;
5. supported relationships and visible pattern;
6. trust architecture;
7. civic fellowship;
8. offerings with maturity;
9. provenance-governed public work;
10. audience pathways;
11. participation close.

Method deepens the process but does not carry the story alone.

## 7. Trust and fellowship

Trust is an institutional outcome of:

- answerability;
- bounded authority;
- institutional memory;
- transparent evidence and review;
- repair capacity.

Civic fellowship is sustained belonging, mutual learning, shared
responsibility, and institution-building. It is not a rank, badge, score,
reputation system, or guaranteed progression.

## 8. Symbolic rules

The inner star represents dignity, hope, and moral orientation. A lived
experience may be represented as a star before institutional recognition.
Listening preserves distinctness. Documentation preserves an account without
claiming proof. Only supported relationships may draw lines. Repeated supported
mechanisms may form a constellation that offers orientation rather than
certainty.

The star must never represent points, evidence density, rank, membership level,
or statistical quantity. Lines must never imply unsupported causality. Res
Publica is not a central sun.

Every symbolic visual must have adjacent plain-language explanation and a
complete text equivalent.

## 9. Product maturity

Public offerings use four current labels:

- **Available now**
- **Partially available**
- **Documented / in development**
- **Methodology**

Non-operational items receive no operational call to action. Internal
infrastructure is excluded from the product inventory entirely.

## 10. Provenance and publication

Collection content is public only when its frontmatter explicitly records:

- `visibility: public`;
- `reviewed: true`;
- a non-empty `source`.

Legacy and demo MDX defaults to internal. This gate applies consistently to
indexes, detail pages, search, RSS, static parameters, and sitemap generation.
Readiness in Publishing Authority is not publication, and current MDX is not
described as approved by that workflow without evidence.

## 11. Member Profile boundary

The Member Profile remains a protected, self-only orientation surface answering:

- Where am I?
- What changed?
- What may come next?

Its API shape and state semantics remain unchanged. Status is not rank.
No scores, badges, guaranteed progression, governance standing, evidence
standing, portfolio, recommendations, payments, or opportunity matching are
introduced.

## 12. Publishing Authority boundary

Publishing Authority appears publicly only as a human-accountability safeguard
for multilingual publication. The public website:

- makes no Publishing Authority write calls;
- exposes no reviewer assignments or internal workflow status;
- creates no “verified” badge;
- does not equate readiness with publication;
- does not imply autonomous publication.

## 13. Accessibility, RTL, and motion

- semantic landmarks and ordered heading levels;
- full keyboard access for interactive elements;
- visible focus states;
- no essential hover behavior;
- no meaning conveyed by color alone;
- complete textual alternative for the constellation;
- mobile-first linear reading order;
- logical CSS properties for RTL;
- Persian uses natural copy and `dir="rtl"`;
- reduced-motion users receive the complete static state;
- no particles, parallax, ambient animation, auto-pan, or spectacle.

## 14. Public/private boundary

The website is a multilingual space for public orientation, information, and
participation. It is not the whole institutional platform and does not expose
sensitive records, internal assignments, governance state, protected workflows,
or infrastructure inventories.

Contact and newsletter interfaces are shown only when confirmed delivery is
operational. Team identities and partnerships are shown only after explicit
publication approval.

## 15. Implementation status

Implemented:

- complete homepage narrative;
- localized Method and Offerings routes;
- source-grounded Mission & Vision and About;
- provenance-gated collections and honest empty states;
- explicit product maturity;
- restrained accessible constellation;
- placeholder team/partner suppression;
- truthful contact and conditional newsletter presentation;
- WHY / HOW / WHAT / JOIN navigation;
- sitemap and metadata continuity;
- preserved Member Profile and Publishing Authority boundaries.

Owner confirmation remains required before publishing real identities,
partnerships, collection entries, contact routes, impact claims, or launching
documented programmes.

## 16. Revision history

- **2026-07-24:** Initial implementation record created from the approved
  integrated public-experience architecture and multi-platform addendum.
