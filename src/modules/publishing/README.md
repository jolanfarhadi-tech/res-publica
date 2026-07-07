# Publishing

Foundation Build Order Step 5, MVP module #3.

## Purpose

The back-stage editorial pipeline: intake → moderation → AI-assisted draft authoring → translation handoff → human sign-off → publish. Kept strictly separate from the public site so AI assistance never bypasses a named human's approval.

## Integration with other modules

- **`draft-authoring.ts`** calls `ai-layer`'s `queryAILayer()` directly — citation-or-refuse enforcement is inherited, not reimplemented.
- **`sign-off.ts`** calls `domain/audit-log`'s `appendEntry()` directly — every sign-off is a real `AuditLog` entry.

## Deliberately not implemented here

`publish.ts` marks a draft "ready to publish" but never writes a file or invokes Git. The actual commit is a separate, explicitly-approved action outside this module's scope.

## Status

Domain logic, moderation, draft authoring (AI-integrated), translation handoff, sign-off (audit-integrated), and publish-readiness are implemented and tested. No persistence layer, no API routes wired, no CLI `publish-draft` lookup yet (all await Backend Architecture).
