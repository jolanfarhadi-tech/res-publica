import { describe, expect, it } from "vitest";
import { locales } from "./config";
import { getDictionary } from "./dictionaries";

describe("public dictionary contract", () => {
  it.each(locales)(
    "does not retain the retired platform-foundation inventory in %s",
    async (locale) => {
      const dictionary = await getDictionary(locale);

      expect("platformFoundation" in dictionary).toBe(false);
    }
  );
});
