CREATE TYPE "public"."person_role" AS ENUM('director', 'actor');--> statement-breakpoint
ALTER TABLE "directors" RENAME TO "people";--> statement-breakpoint
ALTER TABLE "media" RENAME COLUMN "director_id" TO "person_id";--> statement-breakpoint
ALTER TABLE "people" DROP CONSTRAINT "directors_slug_unique";--> statement-breakpoint
ALTER TABLE "director_viewing_items" DROP CONSTRAINT "director_viewing_items_director_id_directors_id_fk";
--> statement-breakpoint
ALTER TABLE "film_directors" DROP CONSTRAINT "film_directors_director_id_directors_id_fk";
--> statement-breakpoint
ALTER TABLE "media" DROP CONSTRAINT "media_director_id_directors_id_fk";
--> statement-breakpoint
DROP INDEX "media_director_idx";--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "primary_role" "person_role" DEFAULT 'director' NOT NULL;--> statement-breakpoint
ALTER TABLE "director_viewing_items" ADD CONSTRAINT "director_viewing_items_director_id_people_id_fk" FOREIGN KEY ("director_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "film_directors" ADD CONSTRAINT "film_directors_director_id_people_id_fk" FOREIGN KEY ("director_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "media_person_idx" ON "media" USING btree ("person_id");--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_slug_unique" UNIQUE("slug");