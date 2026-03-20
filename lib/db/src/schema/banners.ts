import { pgTable, serial, text, boolean, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bannerPositionEnum = pgEnum("banner_position", [
  "TOP",
  "TOP_MOBILE",
  "BELOW_PLAYER",
  "SIDEBAR",
  "BETWEEN_SECTIONS",
  "FOOTER",
  "ABOVE_DESTAQUE",
  "BELOW_DESTAQUE",
  "BELOW_ARTICULISTAS",
  "ABOVE_POLITICA",
  "SIDE_POLITICA",
  "SIDE_GERAL",
  "BELOW_MAIS_LIDAS",
  "ABOVE_ULTIMAS_NOTICIAS",
  "ABOVE_PROGRAMAS",
  "ABOVE_ULTIMAS_NOTICIAS_NEW",
  "ABOVE_NAVEGAR",
  "MID_NEWS",
  "ABOVE_TITLE_NEWS",
]);

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  position: bannerPositionEnum("position").notNull(),
  imageUrl: text("image_url").notNull(),
  targetUrl: text("target_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBannerSchema = createInsertSchema(bannersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof bannersTable.$inferSelect;
