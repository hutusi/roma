import { describe, expect, test } from "bun:test";
import { visibleIn } from "./visibility";

const bothPublished = { status: "published", statusEn: "published" };
const zhOnly = { status: "published", statusEn: "draft" };
const enOnly = { status: "draft", statusEn: "published" };
const bothDraft = { status: "draft", statusEn: "draft" };

describe("visibleIn — the en-subset rule", () => {
  test("zh shows every zh-published row regardless of en status", () => {
    expect(visibleIn(bothPublished, "zh")).toBe(true);
    expect(visibleIn(zhOnly, "zh")).toBe(true);
  });

  test("zh hides zh-drafts", () => {
    expect(visibleIn(enOnly, "zh")).toBe(false);
    expect(visibleIn(bothDraft, "zh")).toBe(false);
  });

  test("en requires BOTH zh and en published (en ⊆ zh)", () => {
    expect(visibleIn(bothPublished, "en")).toBe(true);
    // published in zh but not en — must not appear on /en
    expect(visibleIn(zhOnly, "en")).toBe(false);
    // en-published but zh-draft — must never leak past the zh gate
    expect(visibleIn(enOnly, "en")).toBe(false);
    expect(visibleIn(bothDraft, "en")).toBe(false);
  });
});
