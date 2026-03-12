import { Router } from "express";
import { db } from "@workspace/db";
import { programsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const programs = await db.select().from(programsTable).orderBy(asc(programsTable.sortOrder));
    res.json(programs);
  } catch (err) {
    console.error("admin programs list error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, coverUrl, linkUrl, sortOrder, isActive } = req.body;
    if (!name) { res.status(400).json({ error: "Name is required" }); return; }
    const [program] = await db.insert(programsTable).values({
      name,
      description: description || null,
      coverUrl: coverUrl || null,
      linkUrl: linkUrl || null,
      sortOrder: sortOrder ?? 0,
      isActive: isActive ?? true,
    }).returning();
    res.status(201).json(program);
  } catch (err) {
    console.error("admin programs create error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { name, description, coverUrl, linkUrl, sortOrder, isActive } = req.body;
    const [updated] = await db.update(programsTable).set({
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(coverUrl !== undefined && { coverUrl }),
      ...(linkUrl !== undefined && { linkUrl }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date(),
    }).where(eq(programsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Program not found" }); return; }
    res.json(updated);
  } catch (err) {
    console.error("admin programs update error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    await db.delete(programsTable).where(eq(programsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("admin programs delete error", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
