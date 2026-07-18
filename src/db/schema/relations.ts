import { relations } from "drizzle-orm";
import { users } from "./auth";
import { directorViewingItems, filmCast, filmDirectors, films, filmWatchLinks } from "./films";
import { invitations } from "./invitations";
import { curatedListItems, curatedLists } from "./lists";
import { media } from "./media";
import { people } from "./people";
import { filmTags, tags } from "./tags";
import { listFollows, userListItems, userLists, userMarks } from "./user-content";

export const filmsRelations = relations(films, ({ many }) => ({
  filmDirectors: many(filmDirectors),
  cast: many(filmCast),
  watchLinks: many(filmWatchLinks),
  media: many(media),
  listItems: many(curatedListItems),
  filmTags: many(filmTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  filmTags: many(filmTags),
}));

export const filmTagsRelations = relations(filmTags, ({ one }) => ({
  film: one(films, {
    fields: [filmTags.filmId],
    references: [films.id],
  }),
  tag: one(tags, {
    fields: [filmTags.tagId],
    references: [tags.id],
  }),
}));

export const peopleRelations = relations(people, ({ many }) => ({
  filmDirectors: many(filmDirectors),
  castCredits: many(filmCast),
  viewingItems: many(directorViewingItems),
  media: many(media),
}));

export const filmCastRelations = relations(filmCast, ({ one }) => ({
  film: one(films, {
    fields: [filmCast.filmId],
    references: [films.id],
  }),
  person: one(people, {
    fields: [filmCast.personId],
    references: [people.id],
  }),
}));

export const filmDirectorsRelations = relations(filmDirectors, ({ one }) => ({
  film: one(films, {
    fields: [filmDirectors.filmId],
    references: [films.id],
  }),
  director: one(people, {
    fields: [filmDirectors.directorId],
    references: [people.id],
  }),
}));

export const filmWatchLinksRelations = relations(filmWatchLinks, ({ one }) => ({
  film: one(films, {
    fields: [filmWatchLinks.filmId],
    references: [films.id],
  }),
}));

export const directorViewingItemsRelations = relations(directorViewingItems, ({ one }) => ({
  director: one(people, {
    fields: [directorViewingItems.directorId],
    references: [people.id],
  }),
  film: one(films, {
    fields: [directorViewingItems.filmId],
    references: [films.id],
  }),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  film: one(films, { fields: [media.filmId], references: [films.id] }),
  person: one(people, {
    fields: [media.personId],
    references: [people.id],
  }),
}));

export const curatedListsRelations = relations(curatedLists, ({ one, many }) => ({
  items: many(curatedListItems),
  cover: one(media, {
    fields: [curatedLists.coverMediaId],
    references: [media.id],
  }),
  followers: many(listFollows),
}));

export const curatedListItemsRelations = relations(curatedListItems, ({ one }) => ({
  list: one(curatedLists, {
    fields: [curatedListItems.listId],
    references: [curatedLists.id],
  }),
  film: one(films, {
    fields: [curatedListItems.filmId],
    references: [films.id],
  }),
}));

export const userMarksRelations = relations(userMarks, ({ one }) => ({
  user: one(users, { fields: [userMarks.userId], references: [users.id] }),
  film: one(films, { fields: [userMarks.filmId], references: [films.id] }),
}));

export const userListsRelations = relations(userLists, ({ one, many }) => ({
  user: one(users, { fields: [userLists.userId], references: [users.id] }),
  items: many(userListItems),
}));

export const userListItemsRelations = relations(userListItems, ({ one }) => ({
  list: one(userLists, {
    fields: [userListItems.listId],
    references: [userLists.id],
  }),
  film: one(films, {
    fields: [userListItems.filmId],
    references: [films.id],
  }),
}));

export const listFollowsRelations = relations(listFollows, ({ one }) => ({
  user: one(users, { fields: [listFollows.userId], references: [users.id] }),
  list: one(curatedLists, {
    fields: [listFollows.listId],
    references: [curatedLists.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));
