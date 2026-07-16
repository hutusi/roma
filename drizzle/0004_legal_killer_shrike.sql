DROP INDEX "rum_events_metric_created_idx";--> statement-breakpoint
CREATE INDEX "rum_events_created_idx" ON "rum_events" USING btree ("created_at");