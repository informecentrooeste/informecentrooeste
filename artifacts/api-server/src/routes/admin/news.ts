import { Router } from "express";
import { db } from "@workspace/db";
import { newsTable, categoriesTable, usersTable, newsTagsTable, newsToTagsTable } from "@workspace/db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";
import { cache } from "../../lib/cache.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN", "EDITOR", "AUTHOR"));

function slugify(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

async function getNewsWithRelations(id: number) {
  const [row] = await db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
    .where(eq(newsTable.id, id))
    .limit(1);
  if (!row) return null;

  const tags = await db.select({ id: newsTagsTable.id, name: newsTagsTable.name, slug: newsTagsTable.slug })
    .from(newsTagsTable)
    .innerJoin(newsToTagsTable, eq(newsToTagsTable.tagId, newsTagsTable.id))
    .where(eq(newsToTagsTable.newsId, id));

  return { ...row.news, category: row.category, author: row.author, tags };
}

router.get("/", async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const offset = (page - 1) * limit;
  const status = req.query.status as string | undefined;
  const category = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;

  const conditions: ReturnType<typeof eq>[] = [];
  if (status) conditions.push(eq(newsTable.status, status as "DRAFT" | "PUBLISHED" | "ARCHIVED"));

  // Authors can only see their own articles
  if (req.user!.role === "AUTHOR") conditions.push(eq(newsTable.authorId, req.user!.id));

  if (category) {
    const [cat] = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
    if (cat) conditions.push(eq(newsTable.categoryId, cat.id));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const searchFilter = search ? or(ilike(newsTable.title, `%${search}%`), ilike(newsTable.summary, `%${search}%`)) : undefined;
  const finalWhere = whereClause && searchFilter ? and(whereClause, searchFilter) : (whereClause || searchFilter);

  const [rows, [{ count }]] = await Promise.all([
    db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
      .where(finalWhere)
      .orderBy(desc(newsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(newsTable).where(finalWhere),
  ]);

  const data = rows.map(r => ({ ...r.news, category: r.category, author: r.author, tags: [] }));
  res.json({ data, total: count, page, limit, totalPages: Math.ceil(count / limit) });
});

router.get("/:id", async (req, res) => {
  const article = await getNewsWithRelations(parseInt(req.params.id));
  if (!article) { res.status(404).json({ error: "Not found" }); return; }
  res.json(article);
});

router.post("/", async (req: AuthRequest, res) => {
  const { title, slug, summary, content, featuredImage, status, categoryId, isFeatured, seoTitle, seoDescription, seoKeywords, tagIds } = req.body;
  if (!title || !content || !categoryId) { res.status(400).json({ error: "title, content, and categoryId required" }); return; }

  const finalSlug = slug || slugify(title);
  const authorId = req.user!.id;
  const finalStatus = req.user!.role === "AUTHOR" ? "DRAFT" : (status || "DRAFT");

  const [news] = await db.insert(newsTable).values({
    title, slug: finalSlug, summary, content, featuredImage, status: finalStatus,
    categoryId: parseInt(categoryId), authorId, isFeatured: isFeatured || false,
    publishedAt: finalStatus === "PUBLISHED" ? new Date() : undefined,
    seoTitle, seoDescription, seoKeywords,
  }).returning();

  if (tagIds?.length) {
    await db.insert(newsToTagsTable).values(tagIds.map((tid: number) => ({ newsId: news.id, tagId: tid })));
  }

  cache.invalidatePattern("public:");
  await logAudit(authorId, "CREATE_NEWS", "news", news.id, { title, status: finalStatus });
  const result = await getNewsWithRelations(news.id);
  res.status(201).json(result);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [existing] = await db.select().from(newsTable).where(eq(newsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (req.user!.role === "AUTHOR" && existing.authorId !== req.user!.id) { res.status(403).json({ error: "Forbidden" }); return; }

  const { title, slug, summary, content, featuredImage, categoryId, isFeatured, seoTitle, seoDescription, seoKeywords, tagIds } = req.body;

  await db.update(newsTable).set({
    title, slug, summary, content, featuredImage,
    categoryId: parseInt(categoryId), isFeatured,
    seoTitle, seoDescription, seoKeywords, updatedAt: new Date(),
  }).where(eq(newsTable.id, id));

  if (tagIds !== undefined) {
    await db.delete(newsToTagsTable).where(eq(newsToTagsTable.newsId, id));
    if (tagIds.length) await db.insert(newsToTagsTable).values(tagIds.map((tid: number) => ({ newsId: id, tagId: tid })));
  }

  cache.invalidatePattern("public:");
  await logAudit(req.user!.id, "UPDATE_NEWS", "news", id, { title });
  res.json(await getNewsWithRelations(id));
});

router.patch("/:id/publish", requireRole("ADMIN", "EDITOR"), async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.update(newsTable).set({ status: "PUBLISHED", publishedAt: new Date(), updatedAt: new Date() }).where(eq(newsTable.id, id));
  cache.invalidatePattern("public:");
  await logAudit(req.user!.id, "PUBLISH_NEWS", "news", id);
  res.json(await getNewsWithRelations(id));
});

router.patch("/:id/archive", requireRole("ADMIN", "EDITOR"), async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.update(newsTable).set({ status: "ARCHIVED", updatedAt: new Date() }).where(eq(newsTable.id, id));
  cache.invalidatePattern("public:");
  await logAudit(req.user!.id, "ARCHIVE_NEWS", "news", id);
  res.json(await getNewsWithRelations(id));
});

router.delete("/:id", requireRole("ADMIN"), async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.delete(newsTable).where(eq(newsTable.id, id));
  cache.invalidatePattern("public:");
  await logAudit(req.user!.id, "DELETE_NEWS", "news", id);
  res.json({ message: "Deleted" });
});

export default router;
