import { Router } from "express";
import { db } from "@workspace/db";
import { columnistsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";
import { cache } from "../../lib/cache.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN", "EDITOR"));

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

router.get("/", async (_req, res) => {
  try {
    const columnists = await db.select().from(columnistsTable).orderBy(asc(columnistsTable.sortOrder), asc(columnistsTable.name));
    res.json(columnists);
  } catch (err) {
    console.error("columnists GET error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: AuthRequest, res) => {
  try {
    const { name, photoUrl, bio, articleSlug, sortOrder, isActive } = req.body;
    if (!name) { res.status(400).json({ error: "name is required" }); return; }
    const [columnist] = await db.insert(columnistsTable).values({
      name,
      photoUrl: photoUrl || null,
      bio: bio || null,
      articleSlug: articleSlug || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    }).returning();
    cache.del("public:columnists");
    await logAudit(req.user!.id, "CREATE_COLUMNIST", "columnist", columnist.id, { name });
    res.status(201).json(columnist);
  } catch (err) {
    console.error("columnists POST error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { name, photoUrl, bio, articleSlug, sortOrder, isActive } = req.body;
    const [columnist] = await db.update(columnistsTable).set({
      name,
      photoUrl: photoUrl || null,
      bio: bio || null,
      articleSlug: articleSlug || null,
      sortOrder: sortOrder ?? 0,
      isActive,
      updatedAt: new Date(),
    }).where(eq(columnistsTable.id, id)).returning();
    if (!columnist) { res.status(404).json({ error: "Not found" }); return; }
    cache.del("public:columnists");
    await logAudit(req.user!.id, "UPDATE_COLUMNIST", "columnist", id, { name });
    res.json(columnist);
  } catch (err) {
    console.error("columnists PUT error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") { res.status(400).json({ error: "isActive must be a boolean" }); return; }
    const [columnist] = await db.update(columnistsTable).set({ isActive, updatedAt: new Date() }).where(eq(columnistsTable.id, id)).returning();
    if (!columnist) { res.status(404).json({ error: "Not found" }); return; }
    cache.del("public:columnists");
    res.json(columnist);
  } catch (err) {
    console.error("columnists PATCH error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireRole("ADMIN"), async (req: AuthRequest, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) { res.status(400).json({ error: "Invalid ID" }); return; }
    await db.delete(columnistsTable).where(eq(columnistsTable.id, id));
    cache.del("public:columnists");
    await logAudit(req.user!.id, "DELETE_COLUMNIST", "columnist", id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("columnists DELETE error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
