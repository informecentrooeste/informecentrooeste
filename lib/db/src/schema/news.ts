import { pgTable, serial, text, boolean, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const newsStatusEnum = pgEnum("news_status", ["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  status: newsStatusEnum("status").notNull().default("DRAFT"),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  authorId: integer("author_id").notNull().references(() => usersTable.id),
  isFeatured: boolean("is_featured").notNull().default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  viewCount: integer("view_count").notNull().default(0),
  redirectUrl: text("redirect_url"),
  videoUrl: text("video_url"),
  galleryImages: text("gallery_images"),
  attachmentUrl: text("attachment_url"),
  attachmentName: text("attachment_name"),
});

export const newsTagsTable = pgTable("news_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const newsToTagsTable = pgTable("news_to_tags", {
  newsId: integer("news_id").notNull().references(() => newsTable.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => newsTagsTable.id, { onDelete: "cascade" }),
});

export const insertNewsSchema = createInsertSchema(newsTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true });
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof newsTable.$inferSelect;
export type NewsTag = typeof newsTagsTable.$inferSelect;
