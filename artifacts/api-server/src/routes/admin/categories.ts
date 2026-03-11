import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";
import { cache } from "../../lib/cache.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN", "EDITOR"));

router.get("/", async (_req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.name));
  res.json(cats);
});

router.post("/", async (req: AuthRequest, res) => {
  const { name, slug, description } = req.body;
  if (!name || !slug) { res.status(400).json({ error: "Name and slug required" }); return; }
  const [cat] = await db.insert(categoriesTable).values({ name, slug, description }).returning();
  cache.invalidatePattern("public:categories");
  await logAudit(req.user!.id, "CREATE_CATEGORY", "category", cat.id, { name });
  res.status(201).json(cat);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { name, slug, description } = req.body;
  const [cat] = await db.update(categoriesTable).set({ name, slug, description, updatedAt: new Date() }).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  cache.invalidatePattern("public:categories");
  await logAudit(req.user!.id, "UPDATE_CATEGORY", "category", id, { name });
  res.json(cat);
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { isActive } = req.body;
  const [cat] = await db.update(categoriesTable).set({ isActive, updatedAt: new Date() }).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  cache.invalidatePattern("public:categories");
  await logAudit(req.user!.id, isActive ? "ACTIVATE_CATEGORY" : "DEACTIVATE_CATEGORY", "category", id);
  res.json(cat);
});

export default router;
