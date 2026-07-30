import { describe, expect, it } from "vitest";
import { locales } from "./config";
import { getOpenGraphPresentation } from "./open-graph";

describe("localized Open Graph presentation", () => {
  it.each(["de", "en"] as const)(
    "keeps %s metadata and image copy localized",
    async (locale) => {
      const presentation = await getOpenGraphPresentation(locale);
      expect(presentation.title).toBeTruthy();
      expect(presentation.description).toBeTruthy();
      expect(presentation.imagePath).toBe(`/${locale}/opengraph-image`);
      expect(presentation.imageVariant).toBe("localized");
    }
  );

  it("uses the approved neutral image while retaining Persian metadata", async () => {
    const presentation = await getOpenGraphPresentation("fa");
    expect(presentation.title).toBeTruthy();
    expect(presentation.description).toContain("دموکراسی");
    expect(presentation.imagePath).toBe("/fa/opengraph-image");
    expect(presentation.imageVariant).toBe("neutral");
  });

  it("defines a non-empty image URL for every supported locale", async () => {
    const presentations = await Promise.all(
      locales.map(getOpenGraphPresentation)
    );
    for (const presentation of presentations) {
      expect(presentation.imagePath).toMatch(
        /^\/(de|en|fa)\/opengraph-image$/
      );
    }
  });
});
