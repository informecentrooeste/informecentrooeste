import { Router } from "express";
import { db } from "@workspace/db";
import { newsTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/stats", async (_req, res) => {
  const [
    [{ totalNews }],
    [{ publishedNews }],
    [{ draftNews }],
    [{ archivedNews }],
    [{ totalViews }],
    [{ totalUsers }],
    mostViewedRows,
    recentRows,
  ] = await Promise.all([
    db.select({ totalNews: sql<number>`count(*)::int` }).from(newsTable),
    db.select({ publishedNews: sql<number>`count(*)::int` }).from(newsTable).where(eq(newsTable.status, "PUBLISHED")),
    db.select({ draftNews: sql<number>`count(*)::int` }).from(newsTable).where(eq(newsTable.status, "DRAFT")),
    db.select({ archivedNews: sql<number>`count(*)::int` }).from(newsTable).where(eq(newsTable.status, "ARCHIVED")),
    db.select({ totalViews: sql<number>`coalesce(sum(view_count), 0)::int` }).from(newsTable),
    db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable),
    db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
      .where(eq(newsTable.status, "PUBLISHED"))
      .orderBy(desc(newsTable.viewCount))
      .limit(5),
    db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
      .orderBy(desc(newsTable.createdAt))
      .limit(10),
  ]);

  const buildCard = (r: { news: typeof newsTable.$inferSelect; category: typeof categoriesTable.$inferSelect; author: { id: number; name: string } }) => ({
    ...r.news, category: r.category, author: r.author
  });

  res.json({
    totalNews, publishedNews, draftNews, archivedNews, totalViews, totalUsers,
    mostViewed: mostViewedRows.map(buildCard),
    recentNews: recentRows.map(r => ({ ...r.news, category: r.category, author: r.author, tags: [] })),
  });
});

export default router;
