import { Router } from "express";
import { db } from "@workspace/db";
import { newsTable, categoriesTable, usersTable, bannersTable, videosTable, instagramVideosTable, columnistsTable, siteSettingsTable, newsTagsTable, newsToTagsTable, programsTable } from "@workspace/db";
import { eq, and, desc, asc, sql, ilike, or } from "drizzle-orm";
import { cache, TTL } from "../lib/cache.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

const searchLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

const newsSelect = {
  id: newsTable.id,
  title: newsTable.title,
  slug: newsTable.slug,
  summary: newsTable.summary,
  featuredImage: newsTable.featuredImage,
  publishedAt: newsTable.publishedAt,
  viewCount: newsTable.viewCount,
  isFeatured: newsTable.isFeatured,
};

function buildNewsCard(row: { news: typeof newsSelect & { id: number; title: string; slug: string }; category: { id: number; name: string; slug: string; description: string | null; isActive: boolean; createdAt: Date }; author: { id: number; name: string } }) {
  return {
    ...row.news,
    category: row.category,
    author: row.author,
  };
}

// GET /api/public/news
router.get("/news", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 12);
  const category = req.query.category as string | undefined;
  const featured = req.query.featured as string | undefined;
  const sort = (req.query.sort as string) || "latest";
  const offset = (page - 1) * limit;

  const cacheKey = `public:news:${page}:${limit}:${category}:${featured}:${sort}`;
  const cached = cache.get(cacheKey);
  if (cached) { res.json(cached); return; }

  const conditions = [eq(newsTable.status, "PUBLISHED")];
  if (category) {
    const [cat] = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
    if (cat) conditions.push(eq(newsTable.categoryId, cat.id));
  }
  if (featured === "true") conditions.push(eq(newsTable.isFeatured, true));

  const orderBy = sort === "most_viewed" ? desc(newsTable.viewCount) : desc(newsTable.publishedAt);

  const [rows, [{ count }]] = await Promise.all([
    db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(newsTable).where(and(...conditions)),
  ]);

  const result = {
    data: rows.map(buildNewsCard),
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
  cache.set(cacheKey, result, TTL.MEDIUM);
  res.json(result);
});

// GET /api/public/news/:slug
router.get("/news/:slug", async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `public:article:${slug}`;
  const cached = cache.get(cacheKey);
  if (cached) { res.json(cached); return; }

  const [row] = await db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
    .where(and(eq(newsTable.slug, slug), eq(newsTable.status, "PUBLISHED")))
    .limit(1);

  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  // Increment view count async
  db.update(newsTable).set({ viewCount: sql`${newsTable.viewCount} + 1` }).where(eq(newsTable.id, row.news.id)).catch(() => {});
  cache.del(cacheKey);

  // Tags
  const tags = await db.select({ id: newsTagsTable.id, name: newsTagsTable.name, slug: newsTagsTable.slug })
    .from(newsTagsTable)
    .innerJoin(newsToTagsTable, eq(newsToTagsTable.tagId, newsTagsTable.id))
    .where(eq(newsToTagsTable.newsId, row.news.id));

  // Related news
  const related = await db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
    .where(and(eq(newsTable.categoryId, row.news.categoryId), eq(newsTable.status, "PUBLISHED"), sql`${newsTable.id} != ${row.news.id}`))
    .orderBy(desc(newsTable.publishedAt))
    .limit(4);

  const [prevPost] = await db.select({ title: newsTable.title, slug: newsTable.slug })
    .from(newsTable)
    .where(and(eq(newsTable.status, "PUBLISHED"), sql`${newsTable.publishedAt} < ${row.news.publishedAt}`))
    .orderBy(desc(newsTable.publishedAt))
    .limit(1);

  const [nextPost] = await db.select({ title: newsTable.title, slug: newsTable.slug })
    .from(newsTable)
    .where(and(eq(newsTable.status, "PUBLISHED"), sql`${newsTable.publishedAt} > ${row.news.publishedAt}`))
    .orderBy(asc(newsTable.publishedAt))
    .limit(1);

  const result = {
    ...buildNewsCard(row),
    content: row.news.content,
    seoTitle: row.news.seoTitle,
    seoDescription: row.news.seoDescription,
    seoKeywords: row.news.seoKeywords,
    tags,
    related: related.map(buildNewsCard),
    previousPost: prevPost || null,
    nextPost: nextPost || null,
  };
  cache.set(cacheKey, result, TTL.MEDIUM);
  res.json(result);
});

// GET /api/public/categories
router.get("/categories", async (_req, res) => {
  const cached = cache.get("public:categories");
  if (cached) { res.json(cached); return; }
  const cats = await db.select().from(categoriesTable).where(eq(categoriesTable.isActive, true)).orderBy(asc(categoriesTable.name));
  cache.set("public:categories", cats, TTL.LONG);
  res.json(cats);
});

// GET /api/public/featured-news
router.get("/featured-news", async (_req, res) => {
  const cached = cache.get("public:featured");
  if (cached) { res.json(cached); return; }
  const rows = await db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
    .where(and(eq(newsTable.status, "PUBLISHED"), eq(newsTable.isFeatured, true)))
    .orderBy(desc(newsTable.publishedAt))
    .limit(4);
  const result = rows.map(buildNewsCard);
  cache.set("public:featured", result, TTL.MEDIUM);
  res.json(result);
});

// GET /api/public/latest-news
router.get("/latest-news", async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit as string) || 5);
  const cacheKey = `public:latest:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) { res.json(cached); return; }
  const rows = await db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
    .where(eq(newsTable.status, "PUBLISHED"))
    .orderBy(desc(newsTable.publishedAt))
    .limit(limit);
  const result = rows.map(buildNewsCard);
  cache.set(cacheKey, result, TTL.SHORT);
  res.json(result);
});

// GET /api/public/most-read
router.get("/most-read", async (req, res) => {
  const limit = Math.min(20, parseInt(req.query.limit as string) || 5);
  const cacheKey = `public:most-read:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) { res.json(cached); return; }
  const rows = await db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
    .where(eq(newsTable.status, "PUBLISHED"))
    .orderBy(desc(newsTable.viewCount))
    .limit(limit);
  const result = rows.map(buildNewsCard);
  cache.set(cacheKey, result, TTL.MEDIUM);
  res.json(result);
});

// GET /api/public/sidebar-news
router.get("/sidebar-news", async (req, res) => {
  const category = req.query.category as string | undefined;
  const limit = Math.min(10, parseInt(req.query.limit as string) || 3);
  const cacheKey = `public:sidebar:${category}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) { res.json(cached); return; }

  const conditions = [eq(newsTable.status, "PUBLISHED")];
  if (category) {
    const [cat] = await db.select({ id: categoriesTable.id }).from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
    if (cat) conditions.push(eq(newsTable.categoryId, cat.id));
  }

  const rows = await db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
    .from(newsTable)
    .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
    .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(newsTable.publishedAt))
    .limit(limit);
  const result = rows.map(buildNewsCard);
  cache.set(cacheKey, result, TTL.SHORT);
  res.json(result);
});

// GET /api/public/videos
router.get("/videos", async (_req, res) => {
  const cached = cache.get("public:videos");
  if (cached) { res.json(cached); return; }
  const videos = await db.select().from(videosTable).where(eq(videosTable.isActive, true)).orderBy(desc(videosTable.createdAt));
  cache.set("public:videos", videos, TTL.MEDIUM);
  res.json(videos);
});

// GET /api/public/instagram-videos
router.get("/instagram-videos", async (_req, res) => {
  const cached = cache.get("public:instagram-videos");
  if (cached) { res.json(cached); return; }
  const videos = await db.select().from(instagramVideosTable).where(eq(instagramVideosTable.isActive, true)).orderBy(desc(instagramVideosTable.createdAt)).limit(15);
  cache.set("public:instagram-videos", videos, TTL.MEDIUM);
  res.json(videos);
});

// GET /api/public/programs
router.get("/programs", async (_req, res) => {
  try {
    const cached = cache.get("public:programs");
    if (cached) { res.json(cached); return; }
    const programs = await db.select().from(programsTable)
      .where(eq(programsTable.isActive, true))
      .orderBy(asc(programsTable.sortOrder));
    cache.set("public:programs", programs, TTL.SHORT);
    res.json(programs);
  } catch (err) {
    console.error("public programs error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/public/columnists
router.get("/columnists", async (_req, res) => {
  try {
    const cached = cache.get("public:columnists");
    if (cached) { res.json(cached); return; }
    const columnists = await db.select().from(columnistsTable).where(eq(columnistsTable.isActive, true)).orderBy(asc(columnistsTable.sortOrder));
    cache.set("public:columnists", columnists, TTL.MEDIUM);
    res.json(columnists);
  } catch (err) {
    console.error("public columnists error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/public/columnists/:id
router.get("/columnists/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const cached = cache.get(`public:columnist:${id}`);
    if (cached) { res.json(cached); return; }
    const [columnist] = await db.select().from(columnistsTable).where(and(eq(columnistsTable.id, id), eq(columnistsTable.isActive, true)));
    if (!columnist) { res.status(404).json({ error: "Columnist not found" }); return; }
    let article = null;
    if (columnist.articleSlug) {
      const [found] = await db.select({
        id: newsTable.id,
        title: newsTable.title,
        slug: newsTable.slug,
        summary: newsTable.summary,
        content: newsTable.content,
        featuredImage: newsTable.featuredImage,
        publishedAt: newsTable.publishedAt,
        viewCount: newsTable.viewCount,
      }).from(newsTable).where(and(eq(newsTable.slug, columnist.articleSlug), eq(newsTable.status, "PUBLISHED")));
      article = found || null;
    }
    const result = { ...columnist, article };
    cache.set(`public:columnist:${id}`, result, TTL.MEDIUM);
    res.json(result);
  } catch (err) {
    console.error("public columnist detail error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/public/banners
router.get("/banners", async (req, res) => {
  const position = req.query.position as string | undefined;
  const cacheKey = `public:banners:${position}`;
  const cached = cache.get(cacheKey);
  if (cached) { res.json(cached); return; }

  const now = new Date();
  const conditions = [eq(bannersTable.isActive, true)];
  if (position) conditions.push(eq(bannersTable.position, position as any));

  const banners = await db.select().from(bannersTable).where(and(...conditions)).orderBy(asc(bannersTable.sortOrder), asc(bannersTable.id));
  const filtered = banners.filter(b => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now));
  cache.set(cacheKey, filtered, TTL.SHORT);
  res.json(filtered);
});

// GET /api/public/search
router.get("/search", searchLimiter, async (req, res) => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 2) { res.status(400).json({ error: "Query too short" }); return; }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(20, parseInt(req.query.limit as string) || 10);
  const offset = (page - 1) * limit;

  const searchCondition = or(ilike(newsTable.title, `%${q}%`), ilike(newsTable.summary, `%${q}%`));
  const conditions = [eq(newsTable.status, "PUBLISHED"), searchCondition!];

  const [rows, [{ count }]] = await Promise.all([
    db.select({ news: newsTable, category: categoriesTable, author: { id: usersTable.id, name: usersTable.name } })
      .from(newsTable)
      .innerJoin(categoriesTable, eq(newsTable.categoryId, categoriesTable.id))
      .innerJoin(usersTable, eq(newsTable.authorId, usersTable.id))
      .where(and(...conditions))
      .orderBy(desc(newsTable.publishedAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(newsTable).where(and(...conditions)),
  ]);

  res.json({ data: rows.map(buildNewsCard), total: count, page, limit, totalPages: Math.ceil(count / limit) });
});

// GET /api/public/settings
router.get("/settings", async (_req, res) => {
  const cached = cache.get("public:settings");
  if (cached) { res.json(cached); return; }
  const settings = await db.select().from(siteSettingsTable);
  const result = Object.fromEntries(settings.map(s => [s.key, s.value]));
  cache.set("public:settings", result, TTL.LONG);
  res.json(result);
});

router.get("/weather", async (_req, res) => {
  try {
    const cacheKey = "public:weather";
    const cached = cache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const lat = -20.4644;
    const lon = -45.4269;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo&forecast_days=4`;

    const response = await fetch(url);
    if (!response.ok) { res.status(502).json({ error: "Weather API unavailable" }); return; }
    const data = await response.json() as any;

    const weatherDescriptions: Record<number, string> = {
      0: "Céu limpo", 1: "Predominantemente limpo", 2: "Parcialmente nublado", 3: "Nublado",
      45: "Nevoeiro", 48: "Nevoeiro com geada", 51: "Garoa leve", 53: "Garoa moderada",
      55: "Garoa intensa", 61: "Chuva leve", 63: "Chuva moderada", 65: "Chuva forte",
      71: "Neve leve", 73: "Neve moderada", 75: "Neve forte",
      80: "Pancadas leves", 81: "Pancadas moderadas", 82: "Pancadas fortes",
      95: "Tempestade", 96: "Tempestade com granizo", 99: "Tempestade forte com granizo",
    };

    const weatherIcons: Record<number, string> = {
      0: "sun", 1: "sun", 2: "cloud-sun", 3: "cloud",
      45: "cloud-fog", 48: "cloud-fog",
      51: "cloud-drizzle", 53: "cloud-drizzle", 55: "cloud-drizzle",
      61: "cloud-rain", 63: "cloud-rain", 65: "cloud-rain",
      71: "snowflake", 73: "snowflake", 75: "snowflake",
      80: "cloud-rain", 81: "cloud-rain", 82: "cloud-rain",
      95: "cloud-lightning", 96: "cloud-lightning", 99: "cloud-lightning",
    };

    const current = data.current;
    const daily = data.daily;

    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

    const forecast = [];
    for (let i = 1; i < Math.min(daily.time.length, 4); i++) {
      const date = new Date(daily.time[i] + "T12:00:00");
      forecast.push({
        day: dayNames[date.getDay()],
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        weatherCode: daily.weather_code[i],
        description: weatherDescriptions[daily.weather_code[i]] || "Indisponível",
        icon: weatherIcons[daily.weather_code[i]] || "cloud",
      });
    }

    const result = {
      city: "Formiga",
      state: "MG",
      current: {
        temp: Math.round(current.temperature_2m),
        weatherCode: current.weather_code,
        description: weatherDescriptions[current.weather_code] || "Indisponível",
        icon: weatherIcons[current.weather_code] || "cloud",
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
      },
      forecast,
    };

    cache.set(cacheKey, result, 1800000);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

export default router;
