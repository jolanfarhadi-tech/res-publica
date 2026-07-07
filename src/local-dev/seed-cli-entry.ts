import { seedFixtures } from "./fixtures";

/**
 * CLI entry point for `respublica seed-local`, run via `tsx` (which resolves
 * this project's extensionless relative imports correctly, unlike Node's
 * plain ESM loader — see `scripts/cli.mjs`). Foundation Build Order Step 4.
 */
const store = seedFixtures();
console.log("✓ Local dev store seeded (in-memory, repository-local fixtures only — not a database):");
console.log(`  people: ${store.people.size}`);
console.log(`  consentRecords: ${store.consentRecords.size}`);
console.log(`  payments: ${store.payments.size}`);
console.log(`  organizations: ${store.organizations.size}`);
console.log(`  notifications: ${store.notifications.size}`);
console.log(`  auditLog entries: ${store.auditLog.length}`);
