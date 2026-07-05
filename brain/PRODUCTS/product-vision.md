# Res Publica — Product Vision: An AI-First Civic Platform

*Produced by a 9-person executive product team (Product Strategist, Startup Advisor, UX Researcher, Frontend Designer, Marketing Lead, SEO Specialist, Storytelling Designer, Orientation Designer, Software Architect), grounded in the organization's real mission and existing platform. No code was written and no files were modified in producing this document.*

Res Publica is a real German civic organization for democracy, responsibility, dialogue, research, and public participation — trilingual (German primary, English, Persian/Farsi RTL), organized around three pillars: research, dialogue, and public participation. It measures its own success not by attention but by effect: *did a dialogue take place that would not have happened otherwise? Did a decision become better informed?* Today it runs as a static, Git/MDX-based Next.js site with no CMS, no user accounts, and no personalization. This document describes what it becomes when AI is layered in — deliberately, transparently, and always in service of that existing measure of success, never in service of engagement or hype.

---

## Table of Contents

1. Vision
2. User Personas
3. Visitor Journey
4. Storytelling Engine
5. Orientation Engine
6. Personalization Engine
7. Community Journey
8. AI Features
9. Dashboard Concept
10. Startup Roadmap
11. MVP
12. V2
13. V3
14. Business Model
15. Technical Architecture

---

## 1. Vision

Res Publica's mission has never changed: strengthen the democratic public sphere, foster responsibility, enable participation that reaches people. What changes when this platform becomes AI-first is the unit of what the organization can do for one citizen, at the moment that citizen shows up.

Today, Res Publica publishes to a public. A citizens' dialogue produces recommendations handed to municipal bodies and posted for anyone to read. A research brief sits in the Publications collection until someone finds it. Open municipal data gets translated into something understandable — once, generically, for whoever downloads it. This is good, necessary civic work, and it is fundamentally *broadcast*: one document, one dialogue, one dataset, serving everyone equally and therefore no one precisely.

An AI-first Res Publica inverts this. It becomes an organization that can meet each citizen, researcher, and policymaker where their actual question is — while still publishing everything openly, still measuring itself the way it always has. Concretely, three things change:

**Participation becomes a two-way channel instead of a publication.** A citizen doesn't just read about a Bürgerdialog on local politics — they can ask what the last three rounds of citizen recommendations on this exact topic concluded, in German, English, or Farsi, and get a grounded answer sourced to Res Publica's own published record before they ever set foot in a room. This is the difference between "open dialogue" as a value statement and open dialogue as something a diaspora parent working two jobs can actually access at 11pm in their own language.

**Open data stops requiring a pilot project to become legible.** Understandability becomes a standing capability of the institution rather than a one-time editorial act tied to a single completed project.

**Research and policy analysis become navigable by relevance, not just by publication date.** A research analysis and a position paper aren't isolated documents anymore — they're part of a queryable body of institutional knowledge that finds the policymaker, journalist, or citizen who needs that specific argument for the debate they're in right now.

**What does not change:** AI-first does not mean AI-mediated in the sense of replacing the humans who moderate dialogues, write position papers, or decide what Res Publica stands for. Every AI-generated answer must trace to a specific, published, human-authored Res Publica source. The organization's credibility rests on being independent and rigorous; an AI layer that hallucinates or launders unsourced claims as institutional positions would spend down the one asset — trust — that makes the rest of the mission possible.

**On positioning "AI-first" itself:** Res Publica's audience is self-selected for institutional distrust of hype — people who care about democracy are, by disposition, wary of anything that smells like a pitch. "AI-first" is a Silicon Valley phrase; leading with it imports Silicon Valley's credibility problem into a brand whose value proposition is "we are not that." **AI is the plumbing, not the pitch.** Res Publica should never market itself as an AI platform — it should market itself as a democracy organization that uses AI carefully and transparently in service of its existing measure of success. Every public mention of AI should name the civic job it does ("every dialogue submission is read and summarized within 48 hours, in all three languages"), never the technology for its own sake. A permanent, visible "How we use AI here" page — naming what AI touches and what it never touches (editorial judgment, moderation decisions, published conclusions) — converts skepticism into credibility for this audience; silence reads as concealment, and over-explaining reads as integrity.

**The north star:** Res Publica becomes the civic organization where showing up informed is no longer a privilege of people with time to read annual reports — where a citizen in Munich, a researcher in Berlin, and a Persian-speaking diaspora member abroad can each ask their own question of the same trustworthy institutional record, in their own language, and get an answer that moves them one step closer to participating rather than one step closer to disengaging.

---

## 2. User Personas

Six personas spanning the platform's realistic audience spectrum:

**Sabine, the Engaged Local Citizen** (47, local-administration-adjacent). Wants to know if there's a citizens' dialogue near her and whether her input actually changed anything last time. Today's site organizes content by *type*, not by her question; she has to cross-reference a project page, an event listing, and a publication herself. An AI-first entry point lets her ask directly and get a synthesized answer with a path to register.

**Dr. Farrokh Naderi, the Researcher/Journalist.** Needs to locate primary data, cite impact research accurately, and verify methodology. Today, research and publications live in disconnected collections with no way to query across them. An AI research assistant that synthesizes findings and generates accurate citations turns the site from a document repository into a queryable evidence base.

**Petra, the Policymaker/Civil Servant.** Needs a fast, defensible, three-sentence answer to "what does the evidence say about X," with a source she can cite in a briefing note — not a full position paper to read under time pressure. An AI briefing assistant that condenses research into decision-ready summaries makes Res Publica usable in the actual rhythm of policy work.

**Roya, the Diaspora Community Member (Farsi-speaking).** Follows German civic discourse from abroad; may have limited context on German institutions. Today, missing Farsi translations silently fall back to German, sometimes hitting a language wall. AI-assisted translation that never dead-ends into German, plus an AI concierge that explains German civic concepts in cultural context, would make her feel spoken *to* rather than translated *at*.

**Jens, the First-Time Visitor via Search.** Low intent, high bounce risk; needs to understand what this organization is within 30 seconds. Today he lands on a detail page with no strong on-ramp back to "who is Res Publica." A lightweight, non-intrusive "explain this to me" affordance on every page — not a chatbot popup — reduces bounce and builds first-impression credibility.

**Klaus, the Long-Time Newsletter Subscriber/Supporter.** Wants to stay meaningfully in the loop and feel his continued attention has visible effect. Today he gets the same undifferentiated newsletter as a first-time visitor, with no next step up. A personalized digest and a visible ladder from subscriber → attendee → recurring participant gives him the next right action instead of leaving it to chance.

---

## 3. Visitor Journey

**Today's journey is built for browsing, not for answering questions or building relationships.** Discovery happens via search/social/referral, landing on a specific per-locale page. Understanding "what is this?" requires a manual detour to About/Mission. Finding relevant content means browsing by collection type or using keyword-only search — no synthesis, no recommendations. Converting to engagement has exactly one on-ramp: the newsletter signup, undifferentiated by intent or persona.

**The AI-first divergence, step by step:**

- **Discovery** — same channels, but AI-generated summaries and structured data make Res Publica a good *citation source* for search engines and AI answer engines, not just a page to click. A parallel discovery path emerges: an AI assistant answer, citing Res Publica, landing a visitor directly on a specific research/publication page rather than the homepage — which means every detail page needs a compact "who is Res Publica" trust strip it currently lacks.
- **First impression** — active orientation instead of passive text: a lightweight, in-context "what is this, in one paragraph" affordance replaces the need to hunt for About/Mission.
- **Understanding + finding relevant content collapse into one step** — a visitor asks a real question ("has Res Publica done anything on X?") and gets a synthesized answer pulling across news, projects, research, publications, and events at once. This is the single biggest change: today's site requires the visitor to already understand its taxonomy; the AI-first site absorbs that translation work.
- **Converting to engagement becomes graduated and contextual** — instead of one static newsletter form for everyone, the platform recognizes what kind of visitor this looks like and offers the next relevant action: subscribe, register for a specific nearby event, download a specific dataset.
- **Return visits gain continuity** — with opt-in and appropriate privacy safeguards, the platform can pick up the thread from a prior visit instead of starting from zero every time.

**Discoverability strategy underpinning this journey:** German content should carry the SEO weight of navigational/branded queries; English and Farsi should target different intents — international/diaspora researchers and Persian-speaking civil society respectively (the Farsi RTL build is a genuine, rare differentiator worth deliberate backlink outreach to diaspora media). A three-tier content funnel — cornerstone/orientation pages, collection entries, About/Mission trust pages — should be linked bidirectionally, which today's tag-only, same-collection `getRelated()` doesn't support. Publications and position papers are the real link-bait assets and need citation-friendly summary blocks near the top for journalists to quote accurately. AI-answer-engine visibility (GEO) should be treated as a first-class, parallel discovery stage now, not an afterthought.

---

## 4. Storytelling Engine

Res Publica's raw material is not naturally story-shaped: terse status updates, sober research abstracts, line-by-line legal responses, workshop documentation. This is exactly right for civic credibility — but it means the organization's most important insights currently live buried in disconnected documents. The Storytelling Engine's job is to find and narrate the connections that already exist — not to invent new content.

**Surfacing connective tissue.** The engine runs continuously across the content graph, proposing links an editorial team doesn't have time to trace by hand: a citizens' dialogue project as a live case study for the org's own research finding, both supporting a legislative position — three documents in three collections, none currently cross-referenced. It traces arcs across time too — a "registration open" news item forward to the eventual event writeup and the publications that cite what was discussed there. And it translates register, not just language: turning a rigorous but dense open-data pilot into the accessible plain-language explainer the project itself promises but rarely has staff bandwidth to write.

**Preserving credibility — non-negotiable.** A democracy organization publishing AI-smoothed content without provenance risks becoming the story rather than the storyteller — especially for an audience including Persian-speaking communities for whom unsourced institutional narrative is not an abstract worry. Every engine output ships as a *draft* with visible sourcing: each claim carries an inline link to the specific study, statement, or dialogue outcome it draws from, and nothing publishes without a named human editor's sign-off — extending the same "publish = commit + push" discipline to "AI draft = pull request, human review required." Where evidence is thin, the draft says so rather than smoothing over the gap.

**Storytelling per language, not translation per language.** German content stays precise and institutional, trusting readers to follow a policy argument to its footnotes. English content can afford more explanatory framing for an international/research audience unfamiliar with German civic institutions. Farsi content needs deliberate re-narration, not conversion — a diaspora audience whose relationship to "the state" and "public data" may be shaped by mistrust needs transparency's *importance* made explicit, a point German readers absorb implicitly. The engine flags to editors when a piece written for German assumptions needs a different opening to resonate with the Farsi audience — not just new words for the same sentence.

**Crawlability and trust signals (SEO/GEO input):** structured data should extend beyond today's baseline (Article/Event/BreadcrumbList JSON-LD) to include `dateModified` distinct from `datePublished` (so AI-assisted edits carry a visible freshness/fact-check signal), `citation`/`isBasedOn` properties when referencing external sources, and named human authorship on research/publications specifically — anonymous-institutional authorship is a weaker trust signal for both search quality systems and AI systems weighing civic/political claims. The highest-stakes risk here is *thin AI-slop content*: any AI-assisted entry must state a specific, falsifiable finding in its first two sentences (that's the sentence AI answer engines lift verbatim), and any AI-drafted narrative on civic/political topics should carry a visible "drafted with AI assistance, reviewed by [named researcher]" disclosure — undisclosed AI authorship on political analysis is a reputational risk that doubles as a negative trust signal if discovered.

**Design implications:** two small, MDX-embeddable UI primitives support this without a new content type or CMS: a serif pull-quote/chapter-marker block inside the existing `Prose` renderer (using the same serif already reserved for headings, so it reads as "the institution's authored voice"), and a slim progress rail for long-form multi-chapter narrative pieces — visually consistent with the dialogue-progress affordance proposed for the Dashboard (Section 9), so the design system doesn't invent two unrelated "progress" idioms.

---

## 5. Orientation Engine

Today, a first-time visitor lands on a mission page that says, correctly, "we strengthen the democratic public sphere" — and has to do the work of figuring out what that means for *them*. One static About page, translated three ways, answers three completely different questions with the same paragraph. The Orientation Engine treats first contact as something the platform actively *does*, per visitor, rather than something a visitor decodes alone.

**What it is — and isn't.** Not a chatbot bolted onto the homepage, not a mandatory onboarding wizard with a progress bar. The engine notices how someone arrived and what they seem to be looking for, and offers a single, low-commitment, in-language prompt with three or four tappable openers ("I want to understand what Res Publica is," "I'm looking for an event," "I'm here for the research," "I'm just looking around") plus free text. Answer it, and a grounded, plain-language response hands off immediately to real content. Ignore it, and it fades into the corner — the site behaves exactly like a normal website. The engine's first job is to make itself unnecessary as fast as possible.

**Why translation isn't orientation.** The three language communities carry three different starting assumptions:
- **German visitors** are often already fluent in the civic-org landscape; their real question is competitive — *what does Res Publica do that a dozen similar Vereine don't?* Orientation should skip throat-clearing and go straight to proof: the sharpest recent finding, a concrete outcome, the next real dialogue to walk into.
- **English visitors** are frequently outside observers — academics, journalists, funders — needing comparative framing the German original doesn't require. A small amount of context-translation (independent, non-partisan, not state-affiliated) belongs here.
- **Farsi visitors** most expose the limits of a translated tour: frequently zero prior context on this specific organization, arriving via diaspora networks, and — given the political weight "civic participation" carries for many in this community — often arriving with a live, reasonable first question: *is this safe, is this independent, who is behind this?* Orientation here leads with trust and independence before programs, and is built RTL-native, not mirrored.

**Progressive disclosure, not a funnel.** Layer one is the fifteen-second version (three pillars, one live next action, one line of "why this matters now"). Layer two opens into actual texture — specific projects and outcomes — only if the visitor keeps pulling the thread. Layer three hands the visitor to the full research library once they've demonstrated they want depth. Disclosure is driven by demonstrated curiosity, not a fixed number of screens.

**A handoff that doesn't feel like a handoff.** The engine has no "finish" screen. Everything it learns — declared intent, language, topic interest, first-visit-or-return — becomes the seed state for the Visitor Journey and, eventually, the Personalization/Dashboard experience: the "next action" surfaced isn't pulled from thin air, it's the same thread the orientation conversation was already following, now expressed as a concrete page or reading list.

**SEO/wayfinding synergy:** orientation content is exactly the high-intent "what is X" search territory a civic org should own — but naive 1:1 translation across three locales produces thin, competing duplicate pages. Cornerstone pages should be written natively per locale with different framing (deep-mechanism German, comparative English, trust-and-context-first Farsi) and should carry `DefinedTerm`/`FAQPage` schema — currently absent from the site's JSON-LD — since "what is X" queries are exactly the shape AI assistants answer by lifting a definition. Every cornerstone page should link bidirectionally into 3-5 specific collection entries as proof, closing both the wayfinding and topical-authority gaps at once. A glossary of German civic-participation terms (Bürgerdialog, Bürgerhaushalt, Beteiligungsgesetz) would be disproportionately valuable for this — a genuine content-architecture gap today, not just a missing tag.

**Design implication:** Orientation should borrow the existing `PageHeader` + `Container` visual rhythm rather than a full-bleed onboarding-app aesthetic, and use a breadcrumb-style "you are here" trail rather than a modal tour — a civic-minded visitor is often skeptical of being "sold" a guided experience, and a first-time visitor should feel oriented *within* Res Publica's existing visual language, not teleported into a separate product.

---

## 6. Personalization Engine

**Why personalize civic content at all?** In a commercial context, personalization means maximizing engagement — that model is close to actively hostile to Res Publica's mission and must be explicitly designed against, not inherited by default. The strategic goal here is **relevance to civic agency, not engagement**, in priority order:

1. **Match citizens to participation opportunities they can actually act on** — connecting a reader to the next real, dated, attendable dialogue round in their own municipality, not abstract "more like this" recommendations. Personalization succeeds when it converts a reader into a participant once, at the right moment — not when it maximizes sessions.
2. **Surface research and data relevant to the decision someone is actually facing** — a policymaker evaluating participation legislation should see the related position paper and impact research surfaced together because they inform the same decision, not because they share tags. This is institutional memory retrieval, not content recommendation.
3. **Reduce the language/format barrier for the diaspora and RTL Farsi audience** — proactively flagging when a dialogue result exists in German but not yet Farsi, and offering an AI-assisted bridge rather than silence.

**What this explicitly rules out:** engagement-maximizing personalization (infinite scroll logic, "keep them on site" nudges, opaque behavioral profiling). Any personalization signal used should be legible to the citizen ("shown because you read X"), never a black box.

**Technical feasibility note:** this is the most architecturally consequential item in the whole vision, because it introduces the platform's first user database and its first real privacy/GDPR surface — today there is zero user state. Lightweight personalization (topic/language preferences, saved items, similarity-based "recommended because you read X") is very achievable and can start client-side/local-storage before any account system exists. Anything involving behavioral tracking of individuals' political-topic interests should be treated as high-sensitivity, opt-in-only; the default experience must stay fully anonymous and static.

---

## 7. Community Journey

Today's platform has two rungs: anonymous visitor and newsletter subscriber. Attending a forum, contributing to a dialogue, becoming a recurring supporter — all of it happens off-platform. An AI-first vision builds the missing middle rungs and makes progression between them visible.

**Rung 0→1, Casual visitor → identified interest:** the platform recognizes *what* a visitor cares about (from questions asked and content viewed) and lets them opt into a specific thread ("keep me posted on dialogues near Berlin") rather than one undifferentiated newsletter.

**Rung 1→2, Identified interest → first real-world touch:** today, event pages are often placeholders ("program and registration will be published here") that push visitors off-platform. An AI-first platform closes this gap actively — surfacing the matched event, answering logistics conversationally, confirming registration in-line.

**Rung 2→3, First touch → contributing participant:** today, a dialogue attendee has no digital thread connecting that experience back to the platform. AI-first follow-up surfaces the outcome/report when published and invites the participant to contribute again — the loop closes instead of dead-ending.

**Rung 3→4, Contributing participant → recurring supporter/advocate:** the platform recognizes sustained engagement and makes the "become a supporter" ask feel earned and specific — surfacing the tangible impact of past participation ("your input contributed to this recommendation") as the case for deeper involvement.

**Converting subscribers to evangelists, per language community — this is not one funnel with translation, it's three:**
- **German** — evangelism currency is institutional credibility; the lever is being cited by or co-appearing with recognized civic-education/research institutions. Accelerant: inviting professional subscribers (teachers, officials, journalists) into a lightweight "contributor" review track.
- **English** — a smaller, more international/expat audience whose evangelism currency is being part of a legible, exportable model ("here's how a citizen dialogue works, replicate it"). Accelerant: an open toolkit/methodology page.
- **Farsi/diaspora** — highest potential evangelism intensity but requiring the most trust-building, since diaspora civic engagement carries real personal risk calculus. Evangelism currency is *representation with dignity* — being asked, not spoken for. Accelerant: dedicated Persian-language dialogue formats with visible Persian-speaking facilitators, not translated German ones. This community is also most likely to evangelize through personal/encrypted channels (Telegram, WhatsApp) rather than public social sharing — distribution assets should be shareable one-pagers, not just links.

**The single highest-leverage recurring artifact:** after every dialogue, forum, or publication, one short "what changed" piece per language — a direct line from "citizens said X" to "this is now reflected in Y" — budgeted as a recurring deliverable, not an occasional nice-to-have.

---

## 8. AI Features

The prioritization test for every candidate feature: **does this increase the number of informed civic decisions or genuine dialogues, or does it just look impressive in a demo?**

**Tier 1 — mission-critical, build first:**
- **Grounded, sourced, multilingual Q&A over the institutional archive** — the single highest-leverage feature, working identically across German, English, and Farsi on top of the existing trilingual content model.
- **Cross-collection relevance linking** — a research brief automatically surfaced alongside its related position paper and citizens' dialogue, directly serving the "better informed decision" measure the org already judges itself by.
- **Translation-gap detection and assisted drafting** for the Farsi/diaspora audience — turning the current silent German-fallback into an actively managed gap; a civic-inclusion feature disguised as ops tooling.

**Tier 2 — valuable, sequence after Tier 1:**
- **Personalized participation matching** (Section 6) — depends on Tier 1's retrieval infrastructure being trustworthy first.
- **Dialogue synthesis assistance** for moderators — faster, more consistent recommendation synthesis, without replacing moderator judgment on what those recommendations say.

**Tier 3 — deprioritize or cut:**
- A generic AI chatbot bolted onto every page with no grounding in Res Publica's own content — the "impressive-sounding, mission-empty" pattern to explicitly avoid.
- Engagement/recommendation features borrowed from consumer platforms (autoplay, engagement-ranked feeds) — directly counter to "not attention, but effect."
- AI-generated position statements or research summaries presented as institutional voice without named human authorship — a direct threat to the credibility the mission depends on.

**Technical feasibility note:** source-grounded semantic search and a citing conversational guide are straightforward-to-moderate — they sit cleanly on the existing build-time content pipeline, needing only a vector store and one server endpoint, no user accounts required. What's ambitious is anything asking the AI to reason beyond published content or answer without a citable source — that crosses the hallucination/trust line and should be scoped out or heavily guard-railed. Multilingual retrieval is feasible but requires a genuinely multilingual embedding model, not an English-centric one.

---

## 9. Dashboard Concept

**Premise.** Today's homepage is a public storefront — the same page for everyone. The dashboard is the page the site shows *back* to someone once it knows who they are; it exists only for signed-in users (or a lighter-weight opted-in local profile) and replaces the homepage on session recognition, inheriting every existing visual convention (same header, container rhythm, card style, serif headings) so a returning user feels handed a curated version of a familiar site, not dropped into a different product.

**Three faces:**
- **First-time visitor** — no dashboard yet; just a single dismissible banner inviting a profile/topic-follow, styled like the existing newsletter block. Nothing is built prematurely for someone the system barely knows.
- **Returning visitor** (browsed, not yet participated) — the default digest-and-discovery experience described below.
- **Power user / active participant** — same skeleton, but the top module becomes "Your active dialogues" and an expanded Impact Tracker replaces the collapsed sidebar version, promoting participation evidence the moment it exists.

**Information hierarchy:**
1. A slim personal header strip beneath the main nav ("3 open dialogues near you · new research matched to your interests") — the only place first-name personalization appears; everywhere else stays institutional.
2. **Primary column:** Active Dialogues/Open Participation (status pills — "Open · 4 days left" — never in red, since the palette has no error-red; urgency signaled by weight and the existing gold token); Matched Research & Publications (same card style, different meta line: "Matched: shares your interest in X"); a compact Personalized Digest reading list.
3. **Sidebar:** Upcoming Forums & Events filtered to region/interest; a **Participation History / Impact Tracker** — collapsed by default for returning visitors, expanded for power users, always concrete rather than gamified ("your feedback is cited in the summary report," never points or badges — those read as manipulative in a democracy-institution context); a Follow/Preferences quick-edit chip list; a digest-cadence toggle.
4. Shared, unchanged footer — consistency reassures the user they're still on Res Publica.

**Cold start:** a user with no followed topics sees a "Tell us what you care about" topic-chip module instead of an empty or irrelevant-filler recommendation module.

**Locale/RTL:** identical module set across all three locales — no locale gets a lesser dashboard. Farsi mirrors the entire grid via logical properties (already the site's existing convention), and every date inside the dashboard — digest timestamps, "closes in 4 days," history entries — must render through the existing Solar Hijri formatter, not a generic date library silently reverting to Gregorian; this is the single most likely place a dashboard could accidentally leak the wrong calendar system if built carelessly.

**Accessibility:** one linear DOM reading order regardless of viewport (primary column content before sidebar in source order); a single polite `aria-live` region scoped to the header status line, not the whole page; urgency never signaled by color alone; motion respects the same reduced-motion conventions as existing card hover effects; every module has a proper heading for screen-reader navigation.

**Theming:** no new design tokens — everything builds from the existing seven (ink, bg, surface, accent, accent-contrast, gold, muted, border); the one new visual idiom (status pills) reuses already-AA-verified color combinations.

**Technical feasibility note:** a reader-facing dashboard is straightforward once the Section 6 personalization database exists and reuses existing content APIs, but inherits all of that foundation's auth/privacy weight — it can't be cheaper than the account system underneath it. It implies persistent sessions and authenticated dynamic rendering, a real departure from today's fully static model, and should be an isolated, gated area rather than something that touches the public static pages.

---

## 10. Startup Roadmap

**Operating assumption:** a civic-tech team of this size means 1–3 paid/part-time engineers, a program/content lead, and contracted design/translation help — not a venture-funded squad. The roadmap is sequenced so each phase is independently defensible if grant funding stalls afterward.

- **Phase 0 — Foundation hardening (4–6 weeks, ~0.5 FTE eng).** Before any AI feature, close gaps in content hygiene: consistent frontmatter, stable IDs, translation-status flags. Every downstream AI feature depends on clean, well-structured MDX as its retrieval source. *Risk:* building AI on inconsistent content produces unreliable output that damages trust faster than shipping no AI feature at all.
- **Phase 1 — MVP: AI-assisted civic engagement layer (2–3 months, ~1 FTE eng + part-time program lead).** See Section 11. Highest technical and reputational risk phase — first LLM integration, first user-facing AI surface. *Key risk:* scope creep toward "just add a chatbot"; mitigate by keeping the MVP tightly bounded to grounded, source-cited features only.
- **Phase 2 — V2: Structured participation tooling (4–6 months after MVP validates, ~1.5–2 FTE eng).** Only proceed if MVP shows real engagement signal (repeat use, dialogue completion), not just traffic. Requires a GDPR-clear data-protection posture before opening any public-input surface, and a budgeted part-time moderation role.
- **Phase 3 — V3: Platform maturity (12+ months out, contingent on institutional partnerships).** Not roadmapped with real dates — contingent on Phase 2 proving the org can responsibly run participatory AI at all, and on multi-year institutional funding.

**Cross-cutting risks:** trust-decay (any hallucinated summary is reputationally worse than a missing feature — ship with visible sourcing and an easy correction path at every phase); capacity risk (nonprofits lose engineers to better-paid roles more often than startups lose them to competitors — prefer boring, maintainable tech, which is already this codebase's character); funding-cycle risk (grants are typically 12–18 months and deliverable-tied — phase boundaries are chosen to be independently fundable units); trilingual/RTL debt (every new AI feature must be scoped for DE/EN/FA from day one — retrofitting is far more expensive than designing for it upfront).

---

## 11. MVP — "Grounded Civic Copilot"

**The thesis to prove:** citizens engage more when the platform actively helps them understand and connect to civic issues, not just publishes about them. A generic chatbot proves nothing except that a chatbot exists.

**What ships:**
1. **Cross-collection synthesis, not search.** Replace "search results" (a ranked document list) with a grounded, synthesized, cited answer drawing across news, projects, research, and publications in the user's own locale.
2. **"Explain this to me" on every long-form piece.** One-click, grounded plain-language explanation generated strictly from that document's own text, available in DE/EN/FA regardless of the source's original language.
3. **A structured feedback loop, not a comment box.** A lightweight "was this useful, what's missing" prompt on synthesized answers, routed to the program team — the seed of Phase 2's participation tooling and the org's first real signal on whether AI-assisted engagement works.

**Explicitly excluded:** open-ended chat, any answer sourced from general AI knowledge rather than the org's own content, anything resembling a comment/discussion forum (deferred to Phase 2 for moderation/legal reasons). No feature may produce an unsourced claim.

**Why this is the right minimum:** it uses the org's actual comparative advantage — trilingual, well-curated primary-source content — as the retrieval corpus, is buildable by one engineer plus an LLM integration in roughly 2–3 months on the existing MDX/search infrastructure, and is falsifiable: if synthesis/explanation doesn't meaningfully outperform raw links, that's a useful signal before investing further. **Key risk:** grounding quality — a democracy nonprofit cannot afford an "AI made something up" news cycle, so citation/sourcing must be airtight from day one.

---

## 12. V2 — Structured Participation & Personalized Civic Pathways

Once MVP validates that grounded synthesis deepens engagement, V2 shifts from AI-assisted *consumption* to AI-assisted *participation* — the pillar MVP didn't yet touch.

1. **Structured citizen input tools** — purpose-built formats (not a generic comment box) where AI helps a participant clarify and structure their input before submission, a genuine equity feature for underrepresented or less-articulate voices, feeding into human-reviewed synthesis reports.
2. **Personalized civic pathways** — session-based, privacy-preserving suggestions for the next relevant piece, event, or way to get involved, across all three pillars. This is where the "static site" character finally breaks.
3. **Multilingual dialogue bridging** — a moderated, AI-assisted translation layer letting DE/EN/FA speakers participate in the *same* structured dialogue without a human-translator bottleneck — a distinctive capability few civic platforms have, playing directly to the org's existing trilingual investment.
4. **Moderation and safety infrastructure** — a hard prerequisite, not a feature: AI-assisted flagging (never auto-removal) plus a budgeted part-time human moderator role before any open-input surface goes live.

**Dependencies:** legal/data-protection review is mandatory before shipping structured input tools; the team must grow to include a moderation function as a real budget line, not a footnote.

---

## 13. V3 — Civic Infrastructure Platform

The mature version treats Res Publica not as a publisher with an AI layer, but as connective civic infrastructure other institutions plug into:

- **Institutional dialogue-as-a-service** — municipalities, universities, or other civic orgs use the V2 structured-dialogue and multilingual-bridging tooling to run their own consultations, with Res Publica providing platform, methodology, and independent synthesis/reporting.
- **Longitudinal civic-effect measurement** — actual tracking connecting a dialogue or research output to downstream policy outcomes over time, published as an ongoing public accountability dataset — ambitious and slow, but uniquely credible given the org's founding measure of success.
- **Federated multilingual civic knowledge base** — extending beyond DE/EN/FA as partner organizations contribute, with the same grounding/citation discipline applied at scale.
- **API/embed layer** — letting partner orgs embed Res Publica's grounded synthesis and dialogue tools directly, extending reach without requiring every citizen to visit the site itself.

**Caveat for the board:** a 2+ year horizon requiring multi-year institutional funding and a materially larger team (likely 5–8 FTE across engineering, moderation, partnerships, research). Directional ambition, not a committed roadmap, until V2 proves the participation model works at even modest scale.

---

## 14. Business Model

Given the organization's real character — independent nonprofit, mission measured by civic effect rather than attention or revenue — the model combines several modest, mission-aligned streams rather than one scalable monetization engine. Ad-driven or growth-hacked models are explicitly wrong here: they'd directly contradict "measure by effect, not attention" and compromise the trust AI features depend on.

**Primary funding: grants and institutional support** (majority of budget through MVP/V2). Democracy/civic-tech foundations, German federal civic-education funding, EU digital-democracy programs — well-suited to funding discrete, demonstrable phases; grant applications should treat MVP and V2 as separable, fundable deliverables. A distinct pool worth cultivating: foundations focused specifically on democratic resilience, disinformation, and civic-tech — increasingly interested in funding organizations demonstrating careful, transparent AI use.

**Membership/supporter tiers** (recurring, modest, stabilizing). Individual and light institutional-supporter tiers provide unrestricted funds grants typically can't cover (maintenance, hosting, Phase 0 hardening). The existing newsletter infrastructure is a natural on-ramp — sequence fundraising asks *after* MVP ships something worth supporting.

**Institutional/government partnerships** (medium-term, V2→V3). Fee-for-service civic-infrastructure procurement (not commercial software licensing) as municipalities run dialogues using Res Publica's tooling and facilitation. Requires designed-in conflict-of-interest firewalls (published funding sources, editorial independence policy) from day one — this cannot be improvised once the first check arrives, given the org's own accountability mission.

**Earned revenue: research and consulting** (modest, V2→V3). Commissioned/co-funded research, methodology licensing, paid workshops training other civic organizations in AI-assisted participation methods.

**Event and workshop revenue** (small, steady, low-risk). A well-precedented nonprofit line that directly serves the participation mission rather than sitting alongside it.

**Growth model — depth before reach.** For a civic-legitimacy brand, subscriber count is a vanity metric without participation rate; the primary marketing KPI should be *participation-per-subscriber*, tracked separately per language community. Growth channels ranked by fit: earned media/institutional citation (highest-trust, lowest-cost); partner co-promotion (see below); event-driven acquisition (every forum/workshop is itself an acquisition funnel with a "what changed" follow-up); organic/SEO (leveraging existing i18n/JSON-LD infrastructure for long-tail civic-education terms); paid acquisition only if narrowly targeted at boosting specific published content — never generic brand ads, and never consumer-app growth-hacking tactics (referral incentives, gamified sharing), which would read as manipulative to this audience and damage the credibility the whole model depends on.

**Partnership tracks:** civic education partners (co-branded curriculum, high reach, low/no revenue); university/research partners (the strongest earned-revenue-adjacent track — co-funded studies, with Res Publica providing dialogue infrastructure); media/dialogue-event partners (modest sponsorship, significant reach via inherited trust).

**Hard boundary, stated explicitly and often:** no sponsor, partner, or funder relationship may be positioned in a way that could be read as buying influence over research findings or dialogue outcomes. This boundary is itself a marketing/trust asset that differentiates Res Publica from lower-trust civic-tech and AI-platform competitors.

**Sequencing note:** expect grants to fund Phase 0/MVP almost entirely, membership to start mattering by V2, and institutional/earned revenue to become material only at V3 scale — budget and hiring plans through V2 should assume grant-dependency as the base case.

---

## 15. Technical Architecture

**Starting point.** The current platform is static-first Next.js (App Router): every page and collection entry is an MDX file in Git, Zod-validated at build time, German as source of truth with automatic English/Farsi fallback. Search is a per-locale JSON index built at compile time and matched client-side. No database, no CMS, no user state; publishing is `commit + push`. This is not a limitation to route around — "every published word passed through a reviewed Git commit" is itself a governance feature in a civic-trust context. **Guiding principle: keep the static, source-of-truth content model exactly as it is, and add AI as clearly-bounded services layered beside it — never inside the trust boundary of published content.**

**A three-tier model, ordered by trust and volatility:**
- **Tier 1 — Static Core (unchanged):** MDX-in-Git, build-time rendering, SEO/i18n/JSON-LD/RSS/OG, WCAG AA, client-side keyword search. Nothing an AI feature does may block or slow the render of a public content page.
- **Tier 2 — AI Retrieval Layer (new, read-only over our own content):** a vector index derived deterministically from the same MDX files, plus a retrieval/generation service that answers strictly by citing Tier 1 content — a *cache*, not a source of truth, always rebuildable from the repo.
- **Tier 3 — Personalization & Identity Layer (new, optional, opt-in):** a lightweight database for accounts, saved items, preferences, and conversation history — introduced only where a feature genuinely requires per-user state, firewalled so anonymous visitors still get the full static site.

**New components:**
- **Vector store**, extending the existing build-time indexing step (chunk MDX bodies, embed, upsert into a hosted vector store) — a cache derivable from Git, carrying locale/collection/slug/URL metadata so every retrieved chunk maps to a citable public page.
- **A RAG query service** (a serverless route handler) — the one genuinely dynamic AI endpoint: embeds the question, retrieves top-k grounding chunks for that locale, and answers *only* from those chunks with inline citations. LLM keys stay server-side, exactly like today's newsletter provider keys.
- **A minimal database (Tier 3)**, introduced deliberately and late — the first stateful, highest-governance-weight component in the system.
- **An AI-assisted content pipeline (author-side, not reader-side)** — AI produces MDX drafts (translations, summaries, tag suggestions) that enter the normal Git review flow; AI output becomes published content only after a human commit.

**Preserving current strengths:** AI features hydrate after the static shell, so crawlers still see fully-rendered, canonical, hreflang-tagged HTML (AI-chat surfaces stay `noindex`, like today's search pages). Retrieval is locale-scoped with a multilingual embedding model so German, English, and Farsi share one semantic space. The vector index and all grounding derive from committed MDX — no "shadow content" bypasses review. Conversational UI meets the same WCAG AA bar as the rest of the site.

**Key risks, specific to civic trust:**
1. **Hallucination in a civic guide** is a reputational and democratic-integrity risk, not a UX bug — mitigated by strict source-grounded RAG, mandatory citations, and a "refuse rather than improvise" posture when no source exists.
2. **Citability and provenance** — every answer must link to the specific published page(s) it drew from; unsourced answers should be suppressed entirely.
3. **Data privacy for personalization** — a German org holding records of individuals' political-topic reading is sensitive under GDPR; opt-in only, data minimization, EU data residency, clear retention limits, full anonymous-use path preserved.
4. **LLM cost control at nonprofit scale** — embeddings computed at build time (bounded, cheap); runtime cost lives in the RAG endpoint, controlled via answer caching, small/efficient models with escalation only when needed, rate limits, and a hard monthly spend ceiling with automatic fallback to plain keyword search.
5. **New operational surface** — the vector store and Tier-3 database are the system's first always-on dependencies; every AI/personalization feature must degrade cleanly to the existing static experience if its backing service is down.

**Phasing:** semantic/RAG search (low risk, reuses the existing build pipeline, no accounts) → conversational orientation guide (same retrieval layer, still stateless) → accounts + personalization (the highest-governance step) → editor-side AI content pipeline. This sequences the least trust-sensitive additions first and defers the database until a feature truly demands it.

---

## Appendix: Cross-Cutting Flags for Engineering

Two items surfaced during this strategy review, outside its scope to fix (no files were modified), worth routing to the engineering backlog:

1. **JSON-LD `inLanguage` integrity gap.** The German→English/Farsi content fallback (`src/lib/collections.ts`, `src/lib/content.ts`) can serve German prose under `/en/...` or `/fa/...` URLs while `CollectionDetail.tsx` still emits the requested locale (not the actual content locale) in structured data — a false machine-readable signal to search engines and AI crawlers that will only get more consequential as AI-assisted translation increases publishing volume.
2. **AGENTS.md's Next.js-fork claim.** Multiple independent reviews (in this session and the prior team review) have verified that AGENTS.md's instruction to consult `node_modules/next/dist/docs/` refers to a directory that does not exist — this is a stock, unmodified Next.js install. Worth correcting or removing that instruction so it doesn't mislead future contributors or agents.
