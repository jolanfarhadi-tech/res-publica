# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Res Publica serves people seeking credible civic participation, current and
prospective members, communities, researchers, educators, public institutions,
and civil-society organisations. Visitors need to understand the association's
purpose, inspect its public work, find programmes and events, contact the
association, or use a protected account for their own membership information.

## Product Purpose

The public website is the multilingual institutional presence of Res Publica
e.V. It explains the association's charitable purpose, makes verified work and
publications findable, supports education, dialogue and participation, and
offers accountable paths into contact, events and membership.

The signed Satzung establishes these purposes: political education;
international understanding and intercultural dialogue; democratic civic
governance; media literacy and critical engagement with digital media,
disinformation and algorithmic information systems; scientific and social
reflection on digital governance, technological transformation and artificial
intelligence; democratic innovation; civic self-organisation; and cooperation
with scientific, public and civil-society institutions.

## Positioning

Res Publica connects human experience, civic learning and dialogue with
evidence, institutional answerability and the capacity for repair. It presents
research, programmes, projects, publications and participation as distinct
forms of public work rather than as a commercial product catalogue.

## Operating Context

The website uses one Next.js App Router tree with German, English and Persian
routes. Persian is right-to-left. Public content is stored as reviewed
repository content; private membership data is accessed through authenticated
APIs. Formal membership admission remains a decision of the board. Publishing
Authority protects multilingual editorial readiness without automatically
publishing.

## Capabilities and Constraints

- Preserve every existing route, API contract, authentication flow, database
  integration and backend boundary.
- Keep programmes, products, services and projects distinct.
- RPCS / Civic School is a programme.
- HARM is a research project and methodology under development, not a
  commercial product.
- List only products, services, projects, publications, partners and claims
  supported by accepted repository evidence.
- Profiles and dashboard information are private; there is no public member
  directory.
- Consent preferences are client-controlled and default to necessary
  functionality only. A preference UI must not imply that optional analytics
  or newsletter providers are active when they are not configured.
- Do not automate membership decisions, responsibility judgments, publication
  approval or other bounded human authority.
- Do not use rankings, scores, badges, leaderboards or competitive status
  mechanics.

## Brand Commitments

The name is Res Publica e.V., based in Frankfurt am Main. The voice is calm,
precise, educational, non-partisan and institutionally accountable. The
website must communicate trust, scientific credibility, European civic
legitimacy and respect for human dignity without marketing hype.

The owner has specified a premium, contemporary interface with purposeful
liquid-glass material, excellent typography, restrained motion and high
accessibility. Glass is an interaction and layering material, not decorative
chrome.

## Evidence on Hand

- Signed Satzung of Res Publica e.V., supplied by the owner, dated 15 March
  2026; especially §§ 1-3, 6, 10-17.
- `docs/source/foundation/`
- `docs/source/methodology/`
- `docs/source/academy/`
- `docs/source/projects/`
- `docs/source/standards/`
- Accepted ADRs under `architecture/adr/`
- Implemented routes, modules and tests under `src/`

No verified impact figures, testimonials, completed partnerships, awards or
public member identities are available for invention or display.

## Product Principles

1. Show institutional purpose before interface capability.
2. Separate documented evidence from interpretation and aspiration.
3. Make authority, consent and maturity boundaries visible.
4. Turn civic participation into a clear, dignified path rather than a
   conversion funnel.
5. Let multilingual equivalence and accessibility define completeness.

## Accessibility & Inclusion

The target is WCAG 2.2 AA across keyboard, screen-reader, contrast, focus,
reduced-motion and responsive behaviour. German, English and Persian must be
equivalent; Persian must remain fully right-to-left. Privacy and accessibility
preferences must be understandable and reversible without requiring an
account.
