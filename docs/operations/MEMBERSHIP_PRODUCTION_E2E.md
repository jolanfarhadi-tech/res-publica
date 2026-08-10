# Controlled Membership Production E2E

## Safety boundary

This check never bypasses Auth0, email verification, session resolution, MFA,
capability authorization, board separation of duties, or the closed research
real-data gate. By default it performs no Membership mutation. Never place a
session cookie in Git, chat, command history, a ticket, or test output.

## Anonymous and OIDC boundary

Run with public, non-secret values:

```powershell
$env:MEMBERSHIP_E2E_BASE_URL='https://respublica-ev.de'
$env:MEMBERSHIP_E2E_OIDC_ISSUER='https://dev-z4e38ypuvs0ctrsf.eu.auth0.com/'
npm run ops:membership-e2e
```

The script verifies the anonymous session contract and a genuine Auth0 signup
redirect with the exact Production callback, PKCE, state and nonce. It then
stops with `controlled_auth0_session_required`. Initiating this check creates
one normal, expiring OIDC flow and its shared rate-limit evidence; it creates no
Person, Membership Application, Member, credential or research contribution.

## Controlled authenticated boundary

Use only an owner-approved synthetic administrator test account. Complete the
real Auth0 flow in a private browser, keep the resulting cookie in an ephemeral
local environment variable, and remove it immediately after the check:

```powershell
$env:MEMBERSHIP_E2E_SESSION_COOKIE='<ephemeral controlled session cookie>'
$env:MEMBERSHIP_E2E_REQUIRE_MFA='true'
npm run ops:membership-e2e
Remove-Item Env:MEMBERSHIP_E2E_SESSION_COOKIE
```

The authenticated mode performs read-only checks of the session, the actor's
own Membership Application, Dashboard and Profile. `REQUIRE_MFA=true` accepts
only a genuine `mfa` or `recent-mfa` assurance returned by the application.
It does not submit or decide an application and never prints the cookie.

Application submission and board decision remain controlled institutional
actions. Exercise them only with an approved synthetic identity, an exact
application-scoped board grant and an independently authenticated MFA board
session; retain the resulting canonical AuditLog evidence. Email verification
activates the account only and never confirms Membership.
