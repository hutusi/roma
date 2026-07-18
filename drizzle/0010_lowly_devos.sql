CREATE TABLE "film_tags" (
	"film_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "film_tags_film_id_tag_id_pk" PRIMARY KEY("film_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_zh" text NOT NULL,
	"name_en" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "film_tags" ADD CONSTRAINT "film_tags_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "film_tags" ADD CONSTRAINT "film_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "film_tags_tag_idx" ON "film_tags" USING btree ("tag_id");