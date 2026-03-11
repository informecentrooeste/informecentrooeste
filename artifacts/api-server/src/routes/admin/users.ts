import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireRole, type AuthRequest } from "../../middleware/auth.js";
import { logAudit } from "../../lib/audit.js";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  const offset = (page - 1) * limit;

  const [users, [{ count }]] = await Promise.all([
    db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, isActive: usersTable.isActive, createdAt: usersTable.createdAt, lastLoginAt: usersTable.lastLoginAt })
      .from(usersTable).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
  ]);

  res.json({ data: users, total: count, page, limit, totalPages: Math.ceil(count / limit) });
});

router.post("/", async (req: AuthRequest, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) { res.status(400).json({ error: "All fields required" }); return; }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role }).returning({
    id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, isActive: usersTable.isActive, createdAt: usersTable.createdAt, lastLoginAt: usersTable.lastLoginAt
  });
  await logAudit(req.user!.id, "CREATE_USER", "user", user.id, { email, role });
  res.status(201).json(user);
});

router.put("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { name, email, role } = req.body;
  const [user] = await db.update(usersTable).set({ name, email, role, updatedAt: new Date() }).where(eq(usersTable.id, id)).returning({
    id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, isActive: usersTable.isActive, createdAt: usersTable.createdAt, lastLoginAt: usersTable.lastLoginAt
  });
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  await logAudit(req.user!.id, "UPDATE_USER", "user", id, { name, role });
  res.json(user);
});

router.patch("/:id/status", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { isActive } = req.body;
  const [user] = await db.update(usersTable).set({ isActive, updatedAt: new Date() }).where(eq(usersTable.id, id)).returning({
    id: usersTable.id, name: usersTable.name, email: usersTable.email, role: usersTable.role, isActive: usersTable.isActive, createdAt: usersTable.createdAt, lastLoginAt: usersTable.lastLoginAt
  });
  if (!user) { res.status(404).json({ error: "Not found" }); return; }
  await logAudit(req.user!.id, isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER", "user", id);
  res.json(user);
});

export default router;
