import { Router } from "express";
import { db } from "@workspace/db";
import { auditLogsTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
  const offset = (page - 1) * limit;

  const [rows, [{ count }]] = await Promise.all([
    db.select({ log: auditLogsTable, user: { id: usersTable.id, name: usersTable.name } })
      .from(auditLogsTable)
      .leftJoin(usersTable, eq(auditLogsTable.userId, usersTable.id))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(auditLogsTable),
  ]);

  const data = rows.map(r => ({ ...r.log, user: r.user }));
  res.json({ data, total: count, page, limit, totalPages: Math.ceil(count / limit) });
});

export default router;
