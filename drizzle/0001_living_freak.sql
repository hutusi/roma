CREATE TABLE "rum_events" (
	"id" text PRIMARY KEY NOT NULL,
	"metric" text NOT NULL,
	"value" real NOT NULL,
	"rating" text,
	"path" text NOT NULL,
	"country" text,
	"is_china" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rum_events_metric_created_idx" ON "rum_events" USING btree ("metric","created_at");