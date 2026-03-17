import { Router } from "express";
import { db } from "@workspace/db";
import { citiesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("ADMIN", "EDITOR"));

router.get("/", async (_req, res) => {
  const cities = await db.select().from(citiesTable).orderBy(asc(citiesTable.name));
  res.json(cities);
});

router.post("/", async (req: AuthRequest, res) => {
  const { name, categoryId, isActive } = req.body;
  if (!name || !categoryId) {
    res.status(400).json({ error: "name and categoryId are required" });
    return;
  }
  const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const [city] = await db.insert(citiesTable).values({
    name,
    slug,
    categoryId: parseInt(categoryId),
    isActive: isActive !== false,
  }).returning();

  await logAudit(req.user!.id, "CREATE_CITY", "city", city.id, { name });
  res.status(201).json(city);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { name, categoryId, isActive } = req.body;

  const updates: any = { updatedAt: new Date() };
  if (name !== undefined) {
    updates.name = name;
    updates.slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  }
  if (categoryId !== undefined) updates.categoryId = parseInt(categoryId);
  if (isActive !== undefined) updates.isActive = isActive;

  const [city] = await db.update(citiesTable).set(updates).where(eq(citiesTable.id, id)).returning();
  if (!city) { res.status(404).json({ error: "Not found" }); return; }

  await logAudit(req.user!.id, "UPDATE_CITY", "city", id, { name });
  res.json(city);
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [city] = await db.delete(citiesTable).where(eq(citiesTable.id, id)).returning();
  if (!city) { res.status(404).json({ error: "Not found" }); return; }

  await logAudit(req.user!.id, "DELETE_CITY", "city", id, { name: city.name });
  res.json({ message: "Deleted" });
});

export default router;
