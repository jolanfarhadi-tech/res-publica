# Vercel project consolidation — owner action

## Verified boundary

The custom-domain Production project is `res-publica`. The duplicate project
`res-publica-tq5l` must never receive this platform's Production deployment.
No deletion is authorized by this document.

## Safe owner procedure

1. In Vercel, verify `res-publica` owns `respublica-ev.de`, its Production
   environment variables, deployment history, and Git Production branch.
2. Inspect `res-publica-tq5l` for unique domains, deployments, environment
   variables, logs, integrations, and collaborators.
3. Export or record any legitimate unique configuration without copying secret
   values into Git or tickets.
4. Remove Git/deployment automation from the duplicate first and observe that
   the canonical project remains healthy.
5. Obtain explicit owner approval before deleting the duplicate project.
6. After deletion, verify DNS, custom domain, Production commit, health,
   readiness, login initiation, and rollback availability on `res-publica`.
