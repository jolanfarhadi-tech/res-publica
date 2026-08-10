import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REQUIRED_ACTIVITY_KEYS = [
  "id",
  "operationalStatus",
  "dataSubjects",
  "dataCategories",
  "purposeEvidence",
  "systems",
  "stores",
  "accessBoundary",
  "sourceEvidence",
  "externalDependencies",
  "realDataPermitted",
  "legalBasis",
  "retentionPeriod",
  "erasureRule",
  "decisionGates",
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function schemaTables(root) {
  const files = [
    path.join(root, "src", "persistence", "schema.ts"),
    path.join(root, "src", "persistence", "module-schema.ts"),
  ];
  const tables = [];
  const pattern = /pgTable\(\s*["']([^"']+)["']/g;
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(pattern)) tables.push(match[1]);
  }
  return tables;
}

export function loadProcessingInventory(root = process.cwd()) {
  return readJson(
    path.join(root, "docs", "privacy", "PROCESSING_INVENTORY.json")
  );
}

export function validateProcessingInventory(
  inventory,
  root = process.cwd(),
  humanDocument = fs.readFileSync(
    path.join(root, "docs", "privacy", "PROCESSING_INVENTORY_DRAFT.md"),
    "utf8"
  )
) {
  const errors = [];
  if (
    inventory.documentStatus !==
    "technical-draft-owner-and-legal-approval-required"
  ) {
    errors.push("documentStatus must preserve the legal-approval boundary");
  }
  if (!Array.isArray(inventory.activities) || !inventory.activities.length) {
    errors.push("activities must be a non-empty array");
    return errors;
  }

  const activityIds = new Set();
  const coveredTables = new Set();
  for (const [index, activity] of inventory.activities.entries()) {
    for (const key of REQUIRED_ACTIVITY_KEYS) {
      if (!(key in activity)) errors.push(`activities[${index}] is missing ${key}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(activity.id ?? "")) {
      errors.push(`activities[${index}] has an invalid id`);
    }
    if (activityIds.has(activity.id)) errors.push(`duplicate activity id: ${activity.id}`);
    activityIds.add(activity.id);

    for (const field of ["legalBasis", "retentionPeriod", "erasureRule"]) {
      if (activity[field] !== null) {
        errors.push(`${activity.id}.${field} must remain null until approval`);
      }
    }
    if (!Array.isArray(activity.sourceEvidence) || !activity.sourceEvidence.length) {
      errors.push(`${activity.id} requires sourceEvidence`);
    } else {
      for (const evidence of activity.sourceEvidence) {
        if (!fs.existsSync(path.join(root, evidence))) {
          errors.push(`${activity.id} references missing evidence: ${evidence}`);
        }
      }
    }
    for (const store of activity.stores ?? []) {
      if (store.startsWith("postgres:")) coveredTables.add(store.slice(9));
    }
    if (!humanDocument.includes(`<!-- inventory:${activity.id} -->`)) {
      errors.push(`human inventory is missing activity ${activity.id}`);
    }
  }

  const currentTables = schemaTables(root);
  if (currentTables.length !== new Set(currentTables).size) {
    errors.push("schema parser found duplicate PostgreSQL table names");
  }
  const missingTables = currentTables.filter((table) => !coveredTables.has(table));
  const unknownTables = [...coveredTables].filter(
    (table) => !currentTables.includes(table)
  );
  if (missingTables.length) {
    errors.push(`inventory misses PostgreSQL tables: ${missingTables.join(", ")}`);
  }
  if (unknownTables.length) {
    errors.push(`inventory names unknown PostgreSQL tables: ${unknownTables.join(", ")}`);
  }

  const research = inventory.activities.find(
    (activity) => activity.id === "research-participation-and-wallet"
  );
  if (
    !research ||
    research.realDataPermitted !== false ||
    !research.decisionGates.includes("RESEARCH_REAL_DATA_ACTIVATION_APPROVED")
  ) {
    errors.push("research real-data gate must remain explicit and closed");
  }
  const governance = inventory.activities.find(
    (activity) => activity.id === "harm-governance"
  );
  if (!governance || governance.realDataPermitted !== false) {
    errors.push("HARM/Governance real-data operation must remain closed");
  }
  const audit = inventory.activities.find(
    (activity) => activity.id === "canonical-audit"
  );
  if (!audit || audit.dataCategories.some((value) => /hash chain/i.test(value))) {
    errors.push("canonical audit inventory must match the current non-hash-chain schema");
  }
  return errors;
}

export function checkProcessingInventory(root = process.cwd()) {
  const inventory = loadProcessingInventory(root);
  const errors = validateProcessingInventory(inventory, root);
  if (errors.length) {
    throw new Error(`Processing inventory drift:\n- ${errors.join("\n- ")}`);
  }
  return {
    activities: inventory.activities.length,
    tables: schemaTables(root).length,
  };
}

const isCli = process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  const result = checkProcessingInventory();
  console.log(
    `✓ Processing inventory covers ${result.activities} activities and ${result.tables} PostgreSQL tables`
  );
}
