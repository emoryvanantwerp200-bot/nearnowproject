import { pgTable, serial, text, timestamp, integer, varchar, doublePrecision } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial().primaryKey(),
  authorId: text("author_id").notNull(),
  authorName: varchar("author_name", { length: 120 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("social"),
  text: text().notNull(),
  reactions: integer().notNull().default(0),
  replies: integer().notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const neighborBoardItems = pgTable("neighbor_board_items", {
  id: serial().primaryKey(),
  authorId: text("author_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  zone: varchar("zone", { length: 120 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const familyMembers = pgTable("family_members", {
  id: serial().primaryKey(),
  userId: text("user_id").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  status: varchar("status", { length: 200 }).notNull().default(""),
  note: varchar("note", { length: 200 }).notNull().default(""),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 120 }),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});
