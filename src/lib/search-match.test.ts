import { describe, expect, test } from "bun:test";
import {
  groupResults,
  isQueryLongEnough,
  matchDocs,
  normalizeForSearch,
  type SearchDoc,
} from "./search-match";

function doc(over: Partial<SearchDoc> & Pick<SearchDoc, "href">): SearchDoc {
  return {
    type: "film",
    label: over.href,
    sublabel: null,
    names: [],
    ...over,
  };
}

const casablanca = doc({
  href: "/zh/film/casablanca",
  label: "北非谍影",
  names: ["北非谍影", "卡萨布兰卡", "Casablanca"],
  year: 1942,
});

describe("normalizeForSearch", () => {
  test("folds case and full-width forms", () => {
    expect(normalizeForSearch("ＣＡＳＡｂｌａｎｃａ")).toBe("casablanca");
    expect(normalizeForSearch("  Fellini ")).toBe("fellini");
  });
});

describe("isQueryLongEnough", () => {
  test("empty and single-ASCII queries are too short; single CJK is enough", () => {
    expect(isQueryLongEnough("")).toBe(false);
    expect(isQueryLongEnough("a")).toBe(false);
    expect(isQueryLongEnough("ab")).toBe(true);
    expect(isQueryLongEnough("梦")).toBe(true);
  });
});

describe("matchDocs", () => {
  test("every title variant finds the same film", () => {
    for (const q of ["北非谍影", "卡萨布兰卡", "casablanca", "CASABLANCA"]) {
      expect(matchDocs([casablanca], q).map((d) => d.href)).toEqual(["/zh/film/casablanca"]);
    }
  });

  test("ranking: exact > prefix > contains > prose", () => {
    const docs = [
      doc({ href: "/prose", names: ["别的"], prose: "费里尼的自白" }),
      doc({ href: "/contains", names: ["献给费里尼的信"] }),
      doc({ href: "/prefix", names: ["费里尼入门"] }),
      doc({ href: "/exact", names: ["费里尼"] }),
    ];
    expect(matchDocs(docs, "费里尼").map((d) => d.href)).toEqual([
      "/exact",
      "/prefix",
      "/contains",
      "/prose",
    ]);
  });

  test("at equal tier, films outrank people outrank lists outrank tags", () => {
    const docs = [
      doc({ href: "/tag", type: "tag", names: ["fellini"] }),
      doc({ href: "/list", type: "list", names: ["fellini"] }),
      doc({ href: "/person", type: "person", names: ["fellini"] }),
      doc({ href: "/film", type: "film", names: ["fellini"] }),
    ];
    expect(matchDocs(docs, "fellini").map((d) => d.href)).toEqual([
      "/film",
      "/person",
      "/list",
      "/tag",
    ]);
  });

  test("a fellini query sweeps the corpus: person, films by director name, list", () => {
    const docs = [
      doc({ href: "/zh/film/otto", names: ["八部半", "Otto e mezzo", "Federico Fellini"] }),
      doc({ href: "/zh/director/fellini", type: "person", names: ["Federico Fellini"] }),
      doc({ href: "/zh/list/primer", type: "list", names: ["费里尼入门", "A Fellini Primer"] }),
    ];
    const hrefs = matchDocs(docs, "fellini").map((d) => d.href);
    // Person tier-3 (prefix after "federico "? no — contains) : all three contain.
    expect(hrefs).toEqual(["/zh/film/otto", "/zh/director/fellini", "/zh/list/primer"]);
  });

  test("year matches exactly, never by prefix", () => {
    expect(matchDocs([casablanca], "1942")).toHaveLength(1);
    expect(matchDocs([casablanca], "194")).toHaveLength(0);
  });

  test("single CJK char matches prose; single ASCII char matches nothing", () => {
    const d = doc({ href: "/x", names: ["别名"], prose: "一场梦境" });
    expect(matchDocs([d], "梦")).toHaveLength(1);
    expect(matchDocs([d], "a")).toHaveLength(0);
  });

  test("full-width query matches", () => {
    const d = doc({ href: "/f", names: ["Federico Fellini"] });
    expect(matchDocs([d], "ｆｅｌｌｉｎｉ")).toHaveLength(1);
  });

  test("caps at limit while keeping the best tiers", () => {
    const many = Array.from({ length: 25 }, (_, i) => doc({ href: `/f${i}`, names: ["卡萨"] }));
    expect(matchDocs(many, "卡萨", 20)).toHaveLength(20);
  });
});

describe("groupResults", () => {
  test("fixed group order with empty groups dropped, rank preserved within groups", () => {
    const results = [
      doc({ href: "/p1", type: "person", names: [] }),
      doc({ href: "/f1", names: [] }),
      doc({ href: "/p2", type: "person", names: [] }),
    ];
    const groups = groupResults(results);
    expect(groups.map((g) => g.type)).toEqual(["film", "person"]);
    expect(groups[1].docs.map((d) => d.href)).toEqual(["/p1", "/p2"]);
  });
});
