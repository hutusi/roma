ALTER TABLE "films" ADD COLUMN "is_silent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "tmdb_id" integer;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "imdb_id" text;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "douban_id" text;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "wikidata_id" text;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "restoration_note" text;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "restoration_note_en" text;--> statement-breakpoint
ALTER TABLE "films" ADD CONSTRAINT "films_tmdbId_unique" UNIQUE("tmdb_id");--> statement-breakpoint
ALTER TABLE "films" ADD CONSTRAINT "films_imdbId_unique" UNIQUE("imdb_id");--> statement-breakpoint
ALTER TABLE "films" ADD CONSTRAINT "films_doubanId_unique" UNIQUE("douban_id");