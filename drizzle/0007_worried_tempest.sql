CREATE TABLE "film_cast" (
	"id" text PRIMARY KEY NOT NULL,
	"film_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"name_zh" text,
	"character" text,
	"person_id" text
);
--> statement-breakpoint
ALTER TABLE "film_cast" ADD CONSTRAINT "film_cast_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "film_cast" ADD CONSTRAINT "film_cast_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "film_cast_film_idx" ON "film_cast" USING btree ("film_id");--> statement-breakpoint
CREATE INDEX "film_cast_person_idx" ON "film_cast" USING btree ("person_id");--> statement-breakpoint
INSERT INTO "film_cast" ("id", "film_id", "position", "name", "name_zh", "character")
SELECT gen_random_uuid()::text,
       f."id",
       m.ord - 1,
       m.member->>'name',
       nullif(m.member->>'zhName', ''),
       nullif(m.member->>'character', '')
FROM "films" f
CROSS JOIN LATERAL jsonb_array_elements(f."cast_json") WITH ORDINALITY AS m(member, ord)
WHERE jsonb_typeof(f."cast_json") = 'array'
  AND coalesce(m.member->>'name', '') <> '';--> statement-breakpoint
DO $$
BEGIN
  -- Abort before dropping the column if any named cast entry failed to
  -- copy; nameless entries (there should be none) are skipped by design.
  IF (SELECT count(*) FROM "film_cast") <>
     (SELECT count(*)
      FROM "films" f
      CROSS JOIN LATERAL jsonb_array_elements(f."cast_json") AS m(member)
      WHERE jsonb_typeof(f."cast_json") = 'array'
        AND coalesce(m.member->>'name', '') <> '') THEN
    RAISE EXCEPTION 'film_cast backfill count mismatch — aborting before dropping cast_json';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "films" DROP COLUMN "cast_json";