import { integer, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Text PKs generated app-side, matching better-auth's text user ids so
// foreign keys stay one type everywhere.
export const primaryId = () =>
  text()
    .primaryKey()
    .$defaultFn(() => nanoid());

export const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

export const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/**
 * Optimistic-concurrency counter for editor-saved rows. The edit form
 * carries the revision it loaded; a save under the row lock compares and
 * bumps it, so two editors saving the same film no longer silently
 * overwrite each other. Not updatedAt: its JS-side $onUpdate loses
 * Postgres's microseconds, and publishing bumps it too.
 */
export const revision = () => integer().notNull().default(0);
