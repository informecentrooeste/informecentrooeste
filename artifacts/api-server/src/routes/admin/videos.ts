import { Router } from "express";
import { db } from "@workspace/db";
import { videosTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";
import { cache } from "../../lib/cache.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN", "EDITOR"));

router.get("/", async (_req, res) => {
  const videos = await db.select().from(videosTable).orderBy(desc(videosTable.createdAt));
  res.json(videos);
});

router.post("/", async (req: AuthRequest, res) => {
  const { title, description, sourceType, videoUrl, thumbnailUrl, redirectUrl, isActive } = req.body;
  if (!title || !sourceType || !videoUrl) { res.status(400).json({ error: "title, sourceType, videoUrl required" }); return; }
  const [video] = await db.insert(videosTable).values({ title, description, sourceType, videoUrl, thumbnailUrl, redirectUrl, isActive: isActive ?? true }).returning();
  cache.del("public:videos");
  await logAudit(req.user!.id, "CREATE_VIDEO", "video", video.id, { title });
  res.status(201).json(video);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { title, description, sourceType, videoUrl, thumbnailUrl, redirectUrl, isActive } = req.body;
  const [video] = await db.update(videosTable).set({ title, description, sourceType, videoUrl, thumbnailUrl, redirectUrl, isActive, updatedAt: new Date() }).where(eq(videosTable.id, id)).returning();
  if (!video) { res.status(404).json({ error: "Not found" }); return; }
  cache.del("public:videos");
  await logAudit(req.user!.id, "UPDATE_VIDEO", "video", id, { title });
  res.json(video);
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { isActive } = req.body;
  const [video] = await db.update(videosTable).set({ isActive, updatedAt: new Date() }).where(eq(videosTable.id, id)).returning();
  if (!video) { res.status(404).json({ error: "Not found" }); return; }
  cache.del("public:videos");
  res.json(video);
});

router.delete("/:id", requireRole("ADMIN"), async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  await db.delete(videosTable).where(eq(videosTable.id, id));
  cache.del("public:videos");
  await logAudit(req.user!.id, "DELETE_VIDEO", "video", id);
  res.json({ message: "Deleted" });
});

export default router;
