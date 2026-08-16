# Technical attribution runbook

Status: technical procedure; not proof of provider activation or authority.

1. Open an incident only for activity affecting Res Publica-controlled assets.
   Record the minimum necessary technical observation and never copy passwords,
   tokens, private keys, request bodies or personal profile data.
2. Use the server ingestion boundary so raw network/account/session values are
   transformed before persistence. Do not place raw values in titles, claims,
   tickets or chat.
3. Preserve source and UTC timestamp. Provider-derived ASN, network, VPN/Tor,
   region or reverse-DNS facts may be used only after the enrichment gate is
   approved; label the exact provider/export and retrieval time.
4. A different authorized reviewer records each claim. Cite observation IDs,
   separate observations from inferences, include contradictory evidence and
   alternative explanations, and choose only LOW, MODERATE or HIGH.
5. Use A–D only. Never infer a real person from an IP, account, endpoint,
   User-Agent, route pattern, tool or cluster.
6. Correlate incidents using at least two independent signal classes. A single
   shared source or User-Agent remains insufficient. Record decisive
   contradictions rather than suppressing them.
7. Containment follows the existing capability-quarantine and incident-response
   runbooks. Attribution never authorizes hack-back, source scanning or an
   autonomous destructive response.
8. Preserve append-only evidence and canonical AuditLog references. Corrections
   are new records, not edits. Retention, legal hold, export and deletion remain
   subject to the unapproved security-log/incident policy.

Escalate suspected personal-data compromise, insider activity, provider
compromise or a request for Level-E identity attribution to the named incident
commander and data-protection contact. Those owners remain external gates until
formally appointed.
