import { pgTable, serial, varchar, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const columnistsTable = pgTable("columnists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  articleSlug: varchar("article_slug", { length: 300 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
