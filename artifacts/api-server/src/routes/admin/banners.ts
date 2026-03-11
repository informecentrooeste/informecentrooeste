import { Router } from "express";
import { db } from "@workspace/db";
import { bannersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";
import { cache } from "../../lib/cache.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN", "EDITOR"));

router.get("/", async (_req, res) => {
  const banners = await db.select().from(bannersTable).orderBy(asc(bannersTable.id));
  res.json(banners);
});

router.post("/", async (req: AuthRequest, res) => {
  const { title, position, imageUrl, targetUrl, isActive, startsAt, endsAt } = req.body;
  if (!title || !position || !imageUrl) { res.status(400).json({ error: "title, position, imageUrl required" }); return; }
  const [banner] = await db.insert(bannersTable).values({
    title, position, imageUrl, targetUrl,
    isActive: isActive ?? true,
    startsAt: startsAt ? new Date(startsAt) : undefined,
    endsAt: endsAt ? new Date(endsAt) : undefined,
  }).returning();
  cache.invalidatePattern("public:banners");
  await logAudit(req.user!.id, "CREATE_BANNER", "banner", banner.id, { title });
  res.status(201).json(banner);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { title, position, imageUrl, targetUrl, isActive, startsAt, endsAt } = req.body;
  const [banner] = await db.update(bannersTable).set({
    title, position, imageUrl, targetUrl, isActive,
    startsAt: startsAt ? new Date(startsAt) : undefined,
    endsAt: endsAt ? new Date(endsAt) : undefined,
    updatedAt: new Date(),
  }).where(eq(bannersTable.id, id)).returning();
  if (!banner) { res.status(404).json({ error: "Not found" }); return; }
  cache.invalidatePattern("public:banners");
  await logAudit(req.user!.id, "UPDATE_BANNER", "banner", id, { title });
  res.json(banner);
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { isActive } = req.body;
  const [banner] = await db.update(bannersTable).set({ isActive, updatedAt: new Date() }).where(eq(bannersTable.id, id)).returning();
  if (!banner) { res.status(404).json({ error: "Not found" }); return; }
  cache.invalidatePattern("public:banners");
  res.json(banner);
});

router.delete("/:id", requireRole("ADMIN"), async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.delete(bannersTable).where(eq(bannersTable.id, id));
  cache.invalidatePattern("public:banners");
  await logAudit(req.user!.id, "DELETE_BANNER", "banner", id);
  res.json({ message: "Deleted" });
});

export default router;
