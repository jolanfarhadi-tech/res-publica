import { moduleManifestSchema, type ModuleManifest } from "./manifest";

/**
 * Module Registry — Core Platform's read side of the manifest contract
 * (`ADR-003`): "Core Platform's role is limited to reading these manifests
 * at build/deploy time and wiring routes and tables accordingly."
 *
 * Enforces the same "one fact, one producer" discipline `ADR-002` already
 * established for the domain layer, applied here to table ownership: no
 * two registered modules may claim the same database table, and no module
 * name may be registered twice.
 */

export class ManifestValidationError extends Error {}

const registry = new Map<string, ModuleManifest>();

function findTableOwner(table: string): string | undefined {
  for (const manifest of registry.values()) {
    if (manifest.databaseTables.includes(table)) {
      return manifest.moduleName;
    }
  }
  return undefined;
}

export function registerModule(input: ModuleManifest): ModuleManifest {
  const manifest = moduleManifestSchema.parse(input);

  if (registry.has(manifest.moduleName)) {
    throw new ManifestValidationError(`Module "${manifest.moduleName}" is already registered`);
  }

  for (const table of manifest.databaseTables) {
    const owner = findTableOwner(table);
    if (owner) {
      throw new ManifestValidationError(
        `Table "${table}" is already owned by module "${owner}" — cannot also be owned by "${manifest.moduleName}"`
      );
    }
  }

  registry.set(manifest.moduleName, manifest);
  return manifest;
}

export function getRegisteredModules(): readonly ModuleManifest[] {
  return [...registry.values()];
}

export function getModule(moduleName: string): ModuleManifest | undefined {
  return registry.get(moduleName);
}
