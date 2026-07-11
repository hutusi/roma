import { describe, expect, test } from "bun:test";
import { seedFilms } from "@/db/seed-data/films";
import { countryToEn, countryToZh } from "./countries";

describe("country name mapping", () => {
  test("maps and round-trips", () => {
    expect(countryToEn("法国")).toBe("France");
    expect(countryToZh("France")).toBe("法国");
    expect(countryToZh(countryToEn("苏联"))).toBe("苏联");
  });

  test("unmapped names fall back to the raw string", () => {
    expect(countryToEn("虚构国")).toBe("虚构国");
    expect(countryToZh("Atlantis")).toBe("Atlantis");
  });

  test("covers every country in the seed corpus", () => {
    const unmapped = new Set<string>();
    for (const film of seedFilms) {
      for (const country of film.countries) {
        if (countryToEn(country) === country) unmapped.add(country);
      }
    }
    expect([...unmapped]).toEqual([]);
  });
});
