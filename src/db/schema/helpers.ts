import { text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Text PKs generated app-side, matching better-auth's text user ids so
// foreign keys stay one type everywhere.
export const primaryId = () =>
  text()
    .primaryKey()
    .$defaultFn(() => nanoid());

export const createdAt = () =>
  timestamp({ withTimezone: true }).notNull().defaultNow();

export const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
