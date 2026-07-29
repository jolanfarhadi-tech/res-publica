# Retention matrix — owner/legal decision draft

**No period in this document is approved.** Engineering must not invent a
duration. The owner must fill each decision with legal counsel and provider
contract evidence before lifecycle jobs or public promises are activated.

| Record category | Current technical state | Start/end trigger to approve | Required decision owner | Erasure/exception question |
|---|---|---|---|---|
| Auth0 identity | Provider record plus immutable issuer/subject link | Invitation, last use, deprovisioning | Identity owner + legal | When may provider identity be deleted while preserving accountable link? |
| OIDC flow | Expiring database state | Flow creation/expiry | Security owner | Confirm cleanup interval and failed-flow evidence need |
| Application session | Expiring database state and secure cookie | Login, logout, expiry/revocation | Security owner | Confirm server record and cookie expiry alignment |
| Person/profile | Canonical private record | Creation, correction, relationship end | Membership owner + legal | Define correction, restriction and lawful erasure exceptions |
| Member relationship | Status/history record | Application, decision, relationship end | Board + legal | Membership-law and accounting obligations |
| ConsentRecord | Versioned grant and revocation state | Grant/withdrawal | Data-protection owner | Preserve proof without retaining unnecessary profile data |
| Event registration/waitlist | Confirmed/waitlisted/cancelled record | Registration, event end, cancellation | Event owner + legal | Operational need after event and audit linkage |
| Notification | Append-only delivery record | Creation, sent/failure | Operations + legal | Delivery evidence versus inbox minimization |
| Rate-limit bucket | Explicit expiry plus opportunistic cleanup | Window start/expiry | Security owner | Existing implementation removes records 24h after expiry; approve or change |
| Vercel operational log | Provider-controlled/configurable | Request time | Security owner + legal | Contracted availability, export, incident hold |
| Auth0 security log | Provider-controlled/configurable | Identity event | Security owner + legal | Required ADR-027 export and incident hold |
| Neon backup/history | Provider plan/configuration | Write/restore point | Database owner + legal | Backup expiry and erasure propagation |
| AuditLog | Append-only canonical evidence | Institutional action | Board + legal/data protection | ADR-029 blocks silent deletion; approve retention and pseudonymization |
| Publishing provenance | Draft/version/assignment/decision | Creation, withdrawal, publication | Publishing Authority | Institutional record and source-material rights |
| Governance/HARM record | Sensitive case lifecycle | Intake through closure | Governance + safeguarding + legal | Separate schedules by evidence sensitivity; Production remains gated |
| Browser preferences | Client-side state | Choice/change/clear | Product + legal | Approved default and storage duration |

## Engineering activation rule

Only an approved schedule may authorize automated expiry, deletion,
pseudonymization, archival, legal hold, or provider configuration. Every job
must be scoped, idempotent, observable, capability-controlled where manually
triggered, and tested against backup/restore behavior.
