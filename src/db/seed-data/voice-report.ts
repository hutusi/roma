/**
 * Read-only view of the register rules over the whole corpus. The test is
 * the gate; this is the instrument you use while writing, and the place to
 * look when a rule fires and you want to see the surrounding shape.
 *
 *   bun run src/db/seed-data/voice-report.ts
 *   bun run src/db/seed-data/voice-report.ts --family=film.introduction --lang=zh
 *   bun run src/db/seed-data/voice-report.ts --blocking
 */
import { codePointLength, wordCount } from "../../lib/validators/film";
import { type Finding, proseUnits, runVoiceChecks } from "./voice";

const argv = process.argv.slice(2);
const arg = (n: string) => argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const familyFilter = arg("family");
const langFilter = arg("lang");
const blockingOnly = argv.includes("--blocking");

const units = proseUnits().filter(
  (u) =>
    (!familyFilter || u.family.startsWith(familyFilter)) && (!langFilter || u.lang === langFilter),
);
const findings = runVoiceChecks(units).filter((f) => !blockingOnly || f.severity === "block");

const size = (u: { lang: string; text: string }) =>
  u.lang === "zh" ? codePointLength(u.text) : wordCount(u.text);

console.log(`\n${units.length} prose unit(s)\n`);

// Per-family shape. Length is reported, never asserted: in a reference
// register the notes cluster by genre convention, and the first version
// of this lint wrongly treated that clustering as a defect.
const groups = new Map<string, typeof units>();
for (const u of units) {
  const k = `${u.family} (${u.lang})`;
  groups.set(k, [...(groups.get(k) ?? []), u]);
}
console.log(
  "family".padEnd(28),
  "n".padStart(4),
  "min".padStart(5),
  "med".padStart(5),
  "max".padStart(5),
);
for (const [k, g] of [...groups].sort()) {
  const s = g.map(size).sort((a, b) => a - b);
  console.log(
    k.padEnd(28),
    String(g.length).padStart(4),
    String(s[0]).padStart(5),
    String(s[Math.floor(s.length / 2)]).padStart(5),
    String(s.at(-1)).padStart(5),
  );
}

const byRule = new Map<string, Finding[]>();
for (const f of findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);

const block = findings.filter((f) => f.severity === "block");
console.log(`\n${block.length} blocking, ${findings.length - block.length} advisory\n`);

for (const [rule, fs] of [...byRule].sort((a, b) => b[1].length - a[1].length)) {
  const sev = fs[0].severity === "block" ? "BLOCK" : "advise";
  console.log(`── ${rule} [${sev}] — ${fs.length}`);
  for (const f of fs.slice(0, 8)) console.log(`     ${f.unit} (${f.lang}): ${f.detail}`);
  if (fs.length > 8) console.log(`     … and ${fs.length - 8} more`);
  console.log();
}

process.exit(0);
