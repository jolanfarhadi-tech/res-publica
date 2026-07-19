# ADR-032: License Strategy

## Status

**ACCEPTED** — Founder decision, 2026-07-19.

## Context

Res Publica needs a clear license for its core software that protects
the availability of modifications used to provide network services,
while preserving the option to make the same software available under
separate terms. Contributions must not introduce rights uncertainty
that would prevent the project from maintaining this licensing model.

## Decision

1. The Res Publica core software is licensed under the GNU Affero
   General Public License, version 3 only (`AGPL-3.0-only`). The
   canonical license text is stored in the repository-root `LICENSE`
   file.
2. Res Publica reserves the option, to the extent it holds the necessary
   rights, to offer the software under separate terms. This
   dual-licensing reservation does not withdraw or alter AGPL licenses
   already granted.
3. Contributions require a Contributor License Agreement (CLA) that
   preserves the rights needed for this licensing model.
4. The CLA text and execution process will be approved and published
   separately. Until then, contributions are accepted only by prior
   arrangement with the project maintainers.
5. This ADR does not create or substitute for the CLA's legal terms.

## Alternatives Considered

### Permissive license

Rejected because it would not require operators of modified network
services to make the corresponding source available under the same
license conditions.

### AGPL without a CLA

Rejected because independently held contribution rights could prevent
the project from consistently exercising the approved dual-licensing
option.

### Proprietary-only licensing

Rejected because it would not establish the approved open-source core.

## Consequences

- The repository has a clear, network-copyleft license baseline.
- Distribution and network use must comply with AGPL-3.0-only.
- Alternative licensing is possible only where the necessary rights
  are held.
- External contribution intake remains restricted until the CLA text
  and process have been approved.
- License headers, dependency compatibility, and release packaging must
  remain consistent with this decision.

## Validation Criteria

- The root `LICENSE` contains the canonical, unmodified GNU AGPL v3
  text.
- `README.md` identifies `AGPL-3.0-only`, the dual-licensing
  reservation, and the CLA requirement.
- `CONTRIBUTING.md` states the interim prior-arrangement rule without
  inventing CLA terms.
- Release and contribution processes do not contradict this ADR.

## Human Approval Record

On 2026-07-19, the Founder accepted this decision with the following
instruction:

> ADR-032 ist als Founder-Entscheidung akzeptiert (AGPL-3.0-Kern + CLA
> + Dual-Licensing-Vorbehalt).

The Founder also authorized adding the canonical AGPL-3.0 license text,
the README license notice, the interim contribution rule, and this
accepted ADR.

## References

`../../LICENSE`;
`../../README.md`.
