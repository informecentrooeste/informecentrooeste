import { Router } from "express";
import { db } from "@workspace/db";
import { instagramVideosTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";
import { cache } from "../../lib/cache.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN", "EDITOR"));

const VIDEO_URL_REGEX = /^https?:\/\/(www\.)?(instagram\.com\/(p|reel)\/[\w-]+\/?|youtu\.?be(\.com)?\/(watch\?v=|embed\/|shorts\/)?[\w-]+)/;

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

router.get("/", async (_req, res) => {
  try {
    const videos = await db.select().from(instagramVideosTable).orderBy(desc(instagramVideosTable.createdAt));
    res.json(videos);
  } catch (err) {
    console.error("instagram-videos GET error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { title, description, instagramUrl, thumbnailUrl, platform, isActive } = req.body;
    if (!title || !instagramUrl) { res.status(400).json({ error: "title and instagramUrl are required" }); return; }
    if (!VIDEO_URL_REGEX.test(instagramUrl)) { res.status(400).json({ error: "Invalid URL. Use Instagram (instagram.com/reel/...) or YouTube (youtube.com/watch?v=...)" }); return; }
    const [video] = await db.insert(instagramVideosTable).values({ title, description, instagramUrl, thumbnailUrl, platform: platform || "instagram", isActive: isActive ?? true }).returning();
    cache.del("public:instagram-videos");
    await logAudit(req.user!.id, "CREATE_INSTAGRAM_VIDEO", "instagram_video", video.id, { title });
    res.status(201).json(video);
  } catch (err) {
    console.error("instagram-videos POST error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { title, description, instagramUrl, thumbnailUrl, platform, isActive } = req.body;
    if (instagramUrl && !VIDEO_URL_REGEX.test(instagramUrl)) { res.status(400).json({ error: "Invalid URL. Use Instagram or YouTube links." }); return; }
    const [video] = await db.update(instagramVideosTable).set({ title, description, instagramUrl, thumbnailUrl, platform, isActive, updatedAt: new Date() }).where(eq(instagramVideosTable.id, id)).returning();
    if (!video) { res.status(404).json({ error: "Not found" }); return; }
    cache.del("public:instagram-videos");
    await logAudit(req.user!.id, "UPDATE_INSTAGRAM_VIDEO", "instagram_video", id, { title });
    res.json(video);
  } catch (err) {
    console.error("instagram-videos PUT error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") { res.status(400).json({ error: "isActive must be a boolean" }); return; }
    const [video] = await db.update(instagramVideosTable).set({ isActive, updatedAt: new Date() }).where(eq(instagramVideosTable.id, id)).returning();
    if (!video) { res.status(404).json({ error: "Not found" }); return; }
    cache.del("public:instagram-videos");
    res.json(video);
  } catch (err) {
    console.error("instagram-videos PATCH error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireRole("ADMIN"), async (req: AuthRequest, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    await db.delete(instagramVideosTable).where(eq(instagramVideosTable.id, id));
    cache.del("public:instagram-videos");
    await logAudit(req.user!.id, "DELETE_INSTAGRAM_VIDEO", "instagram_video", id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("instagram-videos DELETE error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
