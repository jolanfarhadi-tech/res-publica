import { describe, expect, it } from "vitest";
import { memberProfileStateFromResponse } from "./member-profile-state";
import {
  englishMemberProfileCopy,
  englishMembershipStatusLabels,
  englishMembershipTierLabels,
  persianMemberProfileCopy,
  persianMembershipStatusLabels,
  persianMembershipTierLabels,
} from "../../i18n/member-profile";

describe("German Member Profile response states", () => {
  it("maps protected-route failures without exposing payloads", async () => {
    await expect(memberProfileStateFromResponse(Response.json({ hidden: "value" }, { status: 401 }))).resolves.toEqual({ kind: "anonymous" });
    await expect(memberProfileStateFromResponse(Response.json({ hidden: "value" }, { status: 503 }))).resolves.toEqual({ kind: "unavailable" });
    await expect(memberProfileStateFromResponse(Response.json({ hidden: "value" }, { status: 500 }))).resolves.toEqual({ kind: "error" });
  });

  it("accepts only successful profile responses as ready", async () => {
    await expect(memberProfileStateFromResponse(Response.json({ enrolled: false }))).resolves.toEqual({
      kind: "ready",
      profile: { enrolled: false },
    });
  });

  it("provides complete English labels for every Membership value", () => {
    expect(Object.keys(englishMembershipStatusLabels)).toHaveLength(10);
    expect(Object.keys(englishMembershipTierLabels)).toHaveLength(5);
    expect(englishMemberProfileCopy.profileLink).toBe("My profile");
    expect(englishMemberProfileCopy.privacyNotice).toContain("your own membership only");
  });

  it("provides complete Persian labels for every Membership value", () => {
    expect(Object.keys(persianMembershipStatusLabels)).toHaveLength(10);
    expect(Object.keys(persianMembershipTierLabels)).toHaveLength(5);
    expect(persianMemberProfileCopy.profileLink).toBe("پروفایل من");
    expect(persianMemberProfileCopy.privacyNotice).toContain("عضویت خود شما");
  });
});
