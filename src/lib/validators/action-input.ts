import { z } from "zod";

/**
 * Shapes for server-action arguments. Server actions are public POST
 * endpoints: a TypeScript parameter type guards nothing, so every
 * argument is parsed before it reaches a query. Row ids are nanoid
 * (21 chars); the bound only keeps garbage out of the database.
 */
export const rowId = z.string().trim().min(1).max(64);
export const optionalRowId = rowId.nullable();

export const markInput = z.object({
  filmId: rowId,
  status: z.enum(["watched", "want"]).nullable(),
});

export const followInput = z.object({ listId: rowId, following: z.boolean() });

export const userListText = z.object({
  title: z.string().max(1000),
  description: z.string().max(1000).optional(),
});

export const roleInput = z.enum(["admin", "editor", "user"]);

export const mediaFields = z.object({
  alt: z.string().max(500).optional(),
  credit: z.string().max(500).optional(),
  kind: z.string().optional(),
  filmId: optionalRowId.optional(),
  personId: optionalRowId.optional(),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
});
