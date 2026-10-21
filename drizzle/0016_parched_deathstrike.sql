ALTER TABLE "media" ADD COLUMN "dominant_color" text;--> statement-breakpoint
CREATE INDEX "curated_list_items_film_idx" ON "curated_list_items" USING btree ("film_id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_dominant_color_hex" CHECK ("media"."dominant_color" ~ '^#[0-9a-f]{6}$');