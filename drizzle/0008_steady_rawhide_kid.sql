ALTER TABLE "film_cast" ADD COLUMN "character_zh" text;--> statement-breakpoint
-- The old single field mixed languages (TMDB zh-CN credits + hand curation).
-- Move CJK/kana role names to character_zh so "character" is Latin/original
-- only — what /en renders. Latin values (Zampanò included) stay put.
UPDATE "film_cast"
SET "character_zh" = "character", "character" = NULL
WHERE "character" ~ '[一-鿿぀-ゟ゠-ヿ]';
