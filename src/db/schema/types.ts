/** Tiptap document — opaque to the database, typed at the app layer. */
export type TiptapDoc = Record<string, unknown>;

/** Cast is display-only in v1 (no actor pages), so it lives in JSONB. */
export type CastMember = {
  name: string;
  zhName?: string;
  character?: string;
};
