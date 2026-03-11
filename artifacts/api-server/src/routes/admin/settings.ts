import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";
import { cache } from "../../lib/cache.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/", async (_req, res) => {
  const settings = await db.select().from(siteSettingsTable);
  res.json(Object.fromEntries(settings.map(s => [s.key, s.value])));
});

router.put("/", async (req: AuthRequest, res) => {
  const updates = req.body as Record<string, string>;
  for (const [key, value] of Object.entries(updates)) {
    await db.insert(siteSettingsTable)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value, updatedAt: new Date() } });
  }
  cache.del("public:settings");
  await logAudit(req.user!.id, "UPDATE_SETTINGS", "settings", undefined, { keys: Object.keys(updates) });
  const settings = await db.select().from(siteSettingsTable);
  res.json(Object.fromEntries(settings.map(s => [s.key, s.value])));
});

export default router;
