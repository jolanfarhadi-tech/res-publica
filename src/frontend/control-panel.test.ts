import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { controlPanelGroups } from "../data/control-panel";
import { controlPanelCopy } from "../i18n/control-panel";
import { accessManagementCopy } from "../i18n/access-management";

const clientSource = readFileSync(
  join(process.cwd(), "src", "components", "platform", "OperationsConsoleClient.tsx"),
  "utf8"
);
const panelSource = readFileSync(
  join(process.cwd(), "src", "components", "platform", "OperationsControlPanel.tsx"),
  "utf8"
);
const accessSource = readFileSync(
  join(process.cwd(), "src", "components", "platform", "AccessManagementPanel.tsx"),
  "utf8"
);

describe("Admin Control Panel", () => {
  it("covers every existing top-level website section with DE, EN and FA labels", () => {
    for (const group of controlPanelGroups) {
      for (const locale of ["de", "en", "fa"] as const) {
        expect(controlPanelCopy[locale].groups[group.id]).toBeTruthy();
      }
      for (const section of group.sections) {
        const routeDirectory = section.path
          ? join(process.cwd(), "src", "app", "[locale]", section.path.slice(1))
          : join(process.cwd(), "src", "app", "[locale]");
        expect(existsSync(join(routeDirectory, "page.tsx"))).toBe(true);
        for (const locale of ["de", "en", "fa"] as const) {
          expect(controlPanelCopy[locale].sections[section.id]).toBeTruthy();
        }
      }
    }
  });

  it("keeps operational authority server-derived and states the protected boundaries", () => {
    expect(clientSource).toContain("overview.operationalAreas.map");
    expect(clientSource).toContain("<OperationsControlPanel");
    expect(panelSource).not.toContain("/api/publishing/workflow");
    expect(controlPanelCopy.de.boundaries.join(" ")).toContain("keine Rechte");
    expect(controlPanelCopy.en.boundaries.join(" ")).toContain("grants no authority");
    expect(controlPanelCopy.fa.boundaries.join(" ")).toContain("هیچ اختیاری اعطا نمی‌کند");
  });

  it("offers only ADR-delegable roles with localized, recent-MFA protected controls", () => {
    expect(clientSource).toContain("<AccessManagementPanel");
    expect(accessSource).toContain('"/api/governance/grants"');
    expect(accessSource).toContain('"/api/publishing/grants"');
    expect(accessSource).toContain("stepUp=recent-mfa");
    expect(accessSource).not.toContain('value="institution-admin"');
    expect(accessSource).not.toContain('value="publisher"');
    for (const locale of ["de", "en", "fa"] as const) {
      expect(accessManagementCopy[locale].title).toBeTruthy();
      expect(accessManagementCopy[locale].granteePersonId).toBeTruthy();
      expect(accessManagementCopy[locale].foundationalBoundary).toBeTruthy();
    }
  });
});
