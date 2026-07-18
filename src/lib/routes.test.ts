import { describe, expect, test } from "bun:test";
import { personPath } from "./routes";

describe("personPath", () => {
  test("primaryRole picks the canonical segment", () => {
    expect(personPath({ slug: "federico-fellini", primaryRole: "director" })).toBe(
      "/director/federico-fellini",
    );
    expect(personPath({ slug: "giulietta-masina", primaryRole: "actor" })).toBe(
      "/actor/giulietta-masina",
    );
  });
});
