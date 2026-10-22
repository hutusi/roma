import { describe, expect, test } from "bun:test";
import { DrizzleQueryError } from "drizzle-orm/errors";
import { isForeignKeyViolation, isUniqueViolation, pgCode, pgConstraint } from "./result";

/** What node-postgres throws, as Drizzle hands it on. */
const pgError = (code: string, constraint?: string) =>
  new DrizzleQueryError("insert …", [], Object.assign(new Error("pg"), { code, constraint }));

describe("constraint errors", () => {
  test("are found on the cause Drizzle wraps them in", () => {
    const unique = pgError("23505", "tags_slug_unique");
    expect(isUniqueViolation(unique)).toBe(true);
    expect(isForeignKeyViolation(unique)).toBe(false);
    expect(pgConstraint(unique)).toBe("tags_slug_unique");
    expect(isForeignKeyViolation(pgError("23503"))).toBe(true);
  });

  test("still read an unwrapped node-postgres error", () => {
    expect(pgCode(Object.assign(new Error("pg"), { code: "23505" }))).toBe("23505");
  });

  test("are absent from anything else", () => {
    for (const error of [null, undefined, "23505", new Error("plain"), { cause: { cause: {} } }]) {
      expect(pgCode(error)).toBeUndefined();
      expect(isUniqueViolation(error)).toBe(false);
    }
    expect(pgConstraint(new Error("plain"))).toBe("");
  });
});
