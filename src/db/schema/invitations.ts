import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, primaryId } from "./helpers";
import { users } from "./auth";

/**
 * Guest-editor invitations. The admin copies /invite/[token] to the
 * invitee; accepting signs them up with the stored role.
 */
export const invitations = pgTable("invitations", {
  id: primaryId(),
  email: text().notNull(),
  role: text().notNull().default("editor"),
  token: text().notNull().unique(),
  invitedBy: text().references(() => users.id, { onDelete: "set null" }),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  acceptedAt: timestamp({ withTimezone: true }),
  createdAt: createdAt(),
});
