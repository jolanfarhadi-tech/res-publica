# ADR-003: Plugin Architecture

## Context

The Master Product Blueprint defines 20 total modules; only 9 are in scope for MVP. Without an explicit extension contract, each of the remaining 11 modules (Fellowship, Academy, Speech/Writing Academy, News Analysis Lab, Research Lab, Store, full Admin Portal, Public API) would need to be wired into Core Platform by directly modifying Core Platform's own code and the code of whichever existing modules it needs to connect to — an increasingly expensive and risky pattern as the module count grows from 9 to 20.

## Decision

Every module — present and future — exposes a manifest describing: which Core Domain Model entities (ADR-002) it reads or writes, what new database tables it owns, what API routes it registers, what (if any) Dashboard module-manifest entry it contributes, and what AI Layer capabilities it consumes. Core Platform's role is limited to reading these manifests at build/deploy time and wiring routes and tables accordingly — it contains no module-specific logic of its own.

## Alternatives Considered

- **Hard-code each module's integration directly into Core Platform as it's built.** Rejected — this is the pattern the decision explicitly avoids; it makes each of the 11 future module additions progressively more expensive, since Core Platform's surface area for direct modification grows every time.
- **A full dynamic plugin marketplace with runtime loading of third-party code.** Rejected as disproportionate — all 20 modules are first-party, built by the same small team; there is no third-party extensibility need to justify the operational and security complexity of runtime plugin loading.
- **Microservices per module.** Rejected — the operational overhead of independently deployed, independently scaled services is disproportionate to a 1–3 engineer nonprofit team's actual capacity, and the manifest-contract approach achieves the same decoupling goal at far lower operational cost.

## Consequences

Building and testing the manifest contract itself is real upfront work that doesn't directly ship a user-facing feature — it's infrastructure investment that pays off starting with the second module wired through it, not the first. The Foundation Review spot-checked the contract shape against 2 of the 9 MVP modules (Events, Community) and found both fit cleanly; a full pass against all 9, and ideally a forward-check against at least one V2 module's anticipated needs, is recommended before the contract is treated as fully validated.

## Future Impact

When Fellowship System is eventually built, it should be addable via one new manifest — referencing `Person` and `Organization` from the Core Domain Model and declaring its own `FellowNomination`/`FellowProfile` tables — without editing Community's code to add "Fellowship awareness" directly. Any new module's manifest should be checked against this same standard before being accepted: does adding it require touching any other module's internals? If yes, the manifest contract itself likely needs to grow to cover the missing case, rather than the new module bypassing it.
