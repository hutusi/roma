ALTER TABLE "films" ADD COLUMN "revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "curated_lists" ADD COLUMN "revision" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "people" ADD COLUMN "revision" integer DEFAULT 0 NOT NULL;