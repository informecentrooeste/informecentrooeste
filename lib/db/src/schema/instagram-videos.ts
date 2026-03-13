import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const instagramVideosTable = pgTable("instagram_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  instagramUrl: text("instagram_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  platform: text("platform").default("instagram"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInstagramVideoSchema = createInsertSchema(instagramVideosTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInstagramVideo = z.infer<typeof insertInstagramVideoSchema>;
export type InstagramVideo = typeof instagramVideosTable.$inferSelect;
