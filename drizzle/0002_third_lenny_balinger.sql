ALTER TABLE "directors" ADD COLUMN "bio_en" text;--> statement-breakpoint
ALTER TABLE "directors" ADD COLUMN "career_essay_en" jsonb;--> statement-breakpoint
ALTER TABLE "directors" ADD COLUMN "status_en" "content_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "directors" ADD COLUMN "published_en_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "director_viewing_items" ADD COLUMN "note_en" text;--> statement-breakpoint
ALTER TABLE "film_watch_links" ADD COLUMN "note_en" text;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "editorial_note_en" text;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "essay_en" jsonb;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "status_en" "content_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "films" ADD COLUMN "published_en_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "curated_list_items" ADD COLUMN "reasoning_en" jsonb;--> statement-breakpoint
ALTER TABLE "curated_lists" ADD COLUMN "title_en" text;--> statement-breakpoint
ALTER TABLE "curated_lists" ADD COLUMN "theme_en" text;--> statement-breakpoint
ALTER TABLE "curated_lists" ADD COLUMN "intro_en" jsonb;--> statement-breakpoint
ALTER TABLE "curated_lists" ADD COLUMN "status_en" "content_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "curated_lists" ADD COLUMN "published_en_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "films_status_en_idx" ON "films" USING btree ("status_en");