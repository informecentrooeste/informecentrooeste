import { Router } from "express";
import { db } from "@workspace/db";
import { bannersTable } from "@workspace/db";
import { eq, asc, and } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";
import { cache } from "../../lib/cache.js";

const VALID_POSITIONS = [
  "TOP", "TOP_MOBILE", "ABOVE_DESTAQUE", "ABOVE_TITLE_NEWS", "MID_NEWS",
] as const;

const MAX_BANNERS_PER_POSITION = 5;

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN", "EDITOR"));

router.get("/", async (_req, res) => {
  try {
    const banners = await db.select().from(bannersTable).orderBy(asc(bannersTable.sortOrder), asc(bannersTable.id));
    res.json(banners);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { title, position, imageUrl, targetUrl, isActive, startsAt, endsAt, sortOrder } = req.body;
    if (!title || !position || !imageUrl) { res.status(400).json({ error: "title, position, imageUrl required" }); return; }
    if (!VALID_POSITIONS.includes(position)) { res.status(400).json({ error: `Invalid position. Valid: ${VALID_POSITIONS.join(", ")}` }); return; }

    const existing = await db.select().from(bannersTable).where(eq(bannersTable.position, position));
    if (existing.length >= MAX_BANNERS_PER_POSITION) {
      res.status(400).json({ error: `Limite de ${MAX_BANNERS_PER_POSITION} banners por posição atingido` });
      return;
    }

    const [banner] = await db.insert(bannersTable).values({
      title, position, imageUrl, targetUrl,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      isActive: isActive ?? true,
      startsAt: startsAt ? new Date(startsAt) : undefined,
      endsAt: endsAt ? new Date(endsAt) : undefined,
    }).returning();
    cache.invalidatePattern("public:banners");
    await logAudit(req.user!.id, "CREATE_BANNER", "banner", banner.id, { title, position });
    res.status(201).json(banner);
  } catch (e) {
    res.status(500).json({ error: "Failed to create banner" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { title, position, imageUrl, targetUrl, isActive, startsAt, endsAt, sortOrder } = req.body;
    if (position && !VALID_POSITIONS.includes(position)) { res.status(400).json({ error: `Invalid position` }); return; }

    if (position) {
      const existing = await db.select().from(bannersTable).where(
        and(eq(bannersTable.position, position))
      );
      const otherBanners = existing.filter(b => b.id !== id);
      if (otherBanners.length >= MAX_BANNERS_PER_POSITION) {
        res.status(400).json({ error: `Limite de ${MAX_BANNERS_PER_POSITION} banners por posição atingido` });
        return;
      }
    }

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (position !== undefined) updates.position = position;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (targetUrl !== undefined) updates.targetUrl = targetUrl;
    if (isActive !== undefined) updates.isActive = isActive;
    if (typeof sortOrder === "number") updates.sortOrder = sortOrder;
    if (startsAt !== undefined) updates.startsAt = startsAt ? new Date(startsAt) : null;
    if (endsAt !== undefined) updates.endsAt = endsAt ? new Date(endsAt) : null;

    const [banner] = await db.update(bannersTable).set(updates).where(eq(bannersTable.id, id)).returning();
    if (!banner) { res.status(404).json({ error: "Not found" }); return; }
    cache.invalidatePattern("public:banners");
    await logAudit(req.user!.id, "UPDATE_BANNER", "banner", id, { title });
    res.json(banner);
  } catch (e) {
    res.status(500).json({ error: "Failed to update banner" });
  }
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { isActive } = req.body;
    const [banner] = await db.update(bannersTable).set({ isActive, updatedAt: new Date() }).where(eq(bannersTable.id, id)).returning();
    if (!banner) { res.status(404).json({ error: "Not found" }); return; }
    cache.invalidatePattern("public:banners");
    res.json(banner);
  } catch (e) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

router.delete("/:id", requireRole("ADMIN"), async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    await db.delete(bannersTable).where(eq(bannersTable.id, id));
    cache.invalidatePattern("public:banners");
    await logAudit(req.user!.id, "DELETE_BANNER", "banner", id);
    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

export default router;
