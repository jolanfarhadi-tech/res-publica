# Fellowship module

Human-gated, non-gamified recognition for bounded civic roles. The module owns
candidacies, qualitative evidence references, reviewer assignment, conflict
declarations, human reviews, final decisions, private Fellowship records and
bounded attribution records. It references canonical Person and AuditLog.

- No score, rank, badge, threshold, automated recommendation, or public roster.
- A candidate or nominator cannot review or decide the candidacy.
- Reviewers must declare conflicts and are recused fail-closed.
- The final decider must be independent from the reviewer.
- Self-application remains disabled unless `FELLOWSHIP_APPLICATIONS_ENABLED=true`.
