# Membership Application Protocol

**Version:** `membership-application-protocol-v1`  
**Status:** Technical implementation protocol; not a membership regulation and
not a substitute for the signed Satzung.

## Purpose

This protocol separates an authenticated account, a membership application, and
a confirmed Membership. It prevents email verification or form submission from
being represented as a board decision.

## Technical sequence

1. The person creates credentials with the configured OIDC provider. Res Publica
   does not receive or store the password.
2. The provider verifies the email address.
3. The verified account submits a membership application.
4. The application is recorded as `application_pending`.
5. An authorized board reviewer examines the application.
6. The reviewer makes an MFA-protected, scope-bound, audited decision.
7. The application becomes `approved` or `rejected`.
8. Only approval creates or verifies the Membership record.
9. Separately defined verified-member functions may then become available.
10. A verified member may separately choose whether to activate the research
    participation wallet when that feature has received all required approvals.

## Independent confirmations

The application records the exact version and timestamp of each confirmation:

- signed Satzung acknowledgement;
- this technical protocol acknowledgement; and
- privacy-notice acknowledgement.

The privacy acknowledgement confirms that the notice was read. It is not
blanket consent. A general willingness to hear about or participate in research
is optional and remains separate from project-specific information and consent.

## Status language

- `application_pending`: account active; membership application under review.
- `approved`: board approved the application; Membership may be verified.
- `rejected`: board rejected the application.

An applicant is not called a temporary, provisional, or verified member before
the board approves the application.

## Authority and records

The application never accepts a reviewer identity from a request body. The
reviewer comes from the authenticated session. Approval and rejection require
the exact application scope, MFA, separation from the applicant, atomic
persistence, and canonical audit evidence.

## Research boundary

Research readiness, project-specific consent, project eligibility, participation,
withdrawal, and exclusion are separate records. Withdrawing research readiness
does not end Membership. No general consent replaces the information and lawful
basis required for a specific project.

## Governing sources

The signed Satzung remains the governing membership source. ADR-037 describes
the proposed application architecture. If either source changes, this protocol
must receive a new version rather than silently changing the recorded text.
