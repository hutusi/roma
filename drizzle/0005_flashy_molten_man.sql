CREATE TABLE "maintenance_runs" (
	"job" text PRIMARY KEY NOT NULL,
	"last_successful_run_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM "media" WHERE "credit" IS NULL OR length(btrim("credit")) = 0) THEN
		RAISE EXCEPTION 'media.credit contains missing attribution; fill real sources before migrating';
	END IF;
END $$;
--> statement-breakpoint
UPDATE "media" SET "credit" = btrim("credit");
--> statement-breakpoint
WITH ranked AS (
	SELECT "id", row_number() OVER (PARTITION BY "list_id" ORDER BY "position", "id") - 1 AS next_position
	FROM "curated_list_items"
)
UPDATE "curated_list_items"
SET "position" = ranked.next_position
FROM ranked
WHERE "curated_list_items"."id" = ranked."id";
--> statement-breakpoint
WITH ranked AS (
	SELECT "id", row_number() OVER (PARTITION BY "list_id" ORDER BY "position", "id") - 1 AS next_position
	FROM "user_list_items"
)
UPDATE "user_list_items"
SET "position" = ranked.next_position
FROM ranked
WHERE "user_list_items"."id" = ranked."id";
--> statement-breakpoint
ALTER TABLE "director_viewing_items" DROP CONSTRAINT "director_viewing_items_film_id_films_id_fk";
--> statement-breakpoint
ALTER TABLE "curated_list_items" DROP CONSTRAINT "curated_list_items_film_id_films_id_fk";
--> statement-breakpoint
ALTER TABLE "user_list_items" DROP CONSTRAINT "user_list_items_film_id_films_id_fk";
--> statement-breakpoint
ALTER TABLE "user_marks" DROP CONSTRAINT "user_marks_film_id_films_id_fk";
--> statement-breakpoint
DROP INDEX "curated_list_items_list_idx";--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "credit" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "director_viewing_items" ADD CONSTRAINT "director_viewing_items_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curated_list_items" ADD CONSTRAINT "curated_list_items_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_marks" ADD CONSTRAINT "user_marks_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curated_list_items" ADD CONSTRAINT "curated_list_items_position_unique" UNIQUE("list_id","position");--> statement-breakpoint
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_position_unique" UNIQUE("list_id","position");--> statement-breakpoint
ALTER TABLE "curated_list_items" ADD CONSTRAINT "curated_list_items_position_nonnegative" CHECK ("curated_list_items"."position" >= 0);--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_credit_nonblank" CHECK (length(btrim("media"."credit")) > 0);--> statement-breakpoint
ALTER TABLE "user_list_items" ADD CONSTRAINT "user_list_items_position_nonnegative" CHECK ("user_list_items"."position" >= 0);
--> statement-breakpoint
INSERT INTO "maintenance_runs" ("job", "last_successful_run_at") VALUES ('rum-retention', to_timestamp(0)) ON CONFLICT ("job") DO NOTHING;
