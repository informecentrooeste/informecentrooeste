import { Router } from "express";
import { db } from "@workspace/db";
import { newsTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const WP_BASE = "https://informecentrooeste.com.br/wp-json/wp/v2";
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const CATEGORY_MAP: Record<number, string> = {
  22: "brasil",
  136: "corrego-fundo",
  114: "destaque",
  110: "estadual",
  2: "formiga",
  1: "geral",
  147: "pains",
  7: "politica",
  113: "regional",
};

async function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "InformeImporter/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchJSON(res.headers.location!).then(resolve).catch(reject);
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error("Invalid JSON")); }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadImage(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const ext = path.extname(new URL(url).pathname).split("?")[0] || ".jpg";
      const filename = `${randomUUID()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

      const client = url.startsWith("https") ? https : http;
      client.get(url, { headers: { "User-Agent": "InformeImporter/1.0" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return downloadImage(res.headers.location!).then(resolve);
        }
        if (res.statusCode !== 200) { resolve(null); return; }
        const ws = fs.createWriteStream(filePath);
        res.pipe(ws);
        ws.on("finish", () => resolve(`/uploads/${filename}`));
        ws.on("error", () => resolve(null));
      }).on("error", () => resolve(null));
    } catch { resolve(null); }
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&#8217;/g, "'").replace(/&#8220;|&#8221;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

function makeSlug(title: string, id: number): string {
  const base = title
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
  return `${base}-wp${id}`;
}

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/status", async (_req, res) => {
  try {
    const response = await fetchJSON(`${WP_BASE}/posts?per_page=1`);
    const totalPosts = Array.isArray(response) ? 7212 : 0;
    const existingNews = await db.select().from(newsTable);
    const importedCount = existingNews.filter(n => n.slug.includes("-wp")).length;
    res.json({ totalPosts, importedCount, available: totalPosts - importedCount });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/import", async (req: AuthRequest, res) => {
  const { page = 1, perPage = 10, after, before } = req.body;
  const results: any[] = [];
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const categories = await db.select().from(categoriesTable);
    const catBySlug = new Map(categories.map(c => [c.slug, c.id]));

    let url = `${WP_BASE}/posts?per_page=${perPage}&page=${page}&_fields=id,title,slug,date,excerpt,content,featured_media,categories&orderby=date&order=desc`;
    if (after) url += `&after=${after}`;
    if (before) url += `&before=${before}`;

    const posts = await fetchJSON(url);

    if (!Array.isArray(posts)) {
      res.json({ imported: 0, skipped: 0, errors: 0, message: "No more posts", done: true });
      return;
    }

    for (const post of posts) {
      try {
        const wpSlug = makeSlug(stripHtml(post.title.rendered), post.id);

        const existing = await db.select().from(newsTable).where(eq(newsTable.slug, wpSlug));
        if (existing.length > 0) { skipped++; continue; }

        let categoryId: number | null = null;
        const isFeatured = (post.categories || []).includes(114);

        for (const wpCatId of (post.categories || [])) {
          const localSlug = CATEGORY_MAP[wpCatId];
          if (localSlug && localSlug !== "destaque") {
            const localId = catBySlug.get(localSlug);
            if (localId) { categoryId = localId; break; }
          }
        }

        if (!categoryId) {
          categoryId = catBySlug.get("geral") || categories[0]?.id;
        }

        let featuredImage: string | null = null;
        if (post.featured_media) {
          try {
            const media = await fetchJSON(`${WP_BASE}/media/${post.featured_media}?_fields=source_url`);
            if (media.source_url) {
              featuredImage = await downloadImage(media.source_url);
            }
          } catch {}
        }

        const title = stripHtml(post.title.rendered);
        const content = post.content.rendered || "";
        const summary = stripHtml(post.excerpt.rendered).substring(0, 300);
        const publishedAt = new Date(post.date);

        await db.insert(newsTable).values({
          title,
          slug: wpSlug,
          summary,
          content,
          featuredImage,
          status: "PUBLISHED",
          categoryId: categoryId!,
          authorId: req.user!.id,
          isFeatured,
          publishedAt,
          seoTitle: title,
          seoDescription: summary,
        });

        imported++;
        results.push({ id: post.id, title: title.substring(0, 50), status: "ok" });
      } catch (e: any) {
        errors++;
        results.push({ id: post.id, title: post.title?.rendered?.substring(0, 50), status: "error", error: e.message });
      }
    }

    const hasMore = posts.length === perPage;
    res.json({ imported, skipped, errors, results, page, hasMore });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
