import {
  pgTable,
  text,
  varchar,
  timestamp,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name"),
  email: varchar("email").unique(),
  emailVerified: boolean("email_verified").default(false),
  image: varchar("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id").primaryKey().notNull(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id),
    token: varchar("token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address"),
    userAgent: varchar("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("IDX_session_token").on(table.token)]
);

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  accountId: varchar("account_id").notNull(),
  providerId: varchar("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: varchar("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: varchar("id").primaryKey().notNull(),
  identifier: varchar("identifier").notNull(),
  value: varchar("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const folders = pgTable("folders", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  parentId: integer("parent_id"),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  folderId: integer("folder_id"),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  isStarred: boolean("is_starred").default(false),
  isTrashed: boolean("is_trashed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  folders: many(folders),
  files: many(files),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
  parent: one(folders, {
    fields: [folders.parentId],
    references: [folders.id],
  }),
  children: many(folders),
  files: many(files),
  user: one(users, {
    fields: [folders.userId],
    references: [users.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  folder: one(folders, {
    fields: [files.folderId],
    references: [folders.id],
  }),
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Verification = typeof verifications.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type File = typeof files.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertSession = typeof sessions.$inferInsert;
export type InsertAccount = typeof accounts.$inferInsert;
export type InsertVerification = typeof verifications.$inferInsert;
export type InsertFolder = typeof folders.$inferInsert;
export type InsertFile = typeof files.$inferInsert;
export type UpsertUser = typeof users.$inferInsert & {
  id: string;
};
