import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "@workspace/db";
import { usersTable, refreshTokensTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken, getRefreshExpiresAt } from "../lib/jwt.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Check account lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    res.status(429).json({ error: "Account temporarily locked. Try again later." });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    await db.update(usersTable).set({
      failedLoginAttempts: attempts,
      lockedUntil: lockedUntil || undefined,
    }).where(eq(usersTable.id, user.id));
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Reset failed attempts on success
  await db.update(usersTable).set({
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
  }).where(eq(usersTable.id, user.id));

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await db.insert(refreshTokensTable).values({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshExpiresAt(),
  });

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt, lastLoginAt: user.lastLoginAt },
  });
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: "Refresh token required" });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const [stored] = await db.select().from(refreshTokensTable).where(
      and(
        eq(refreshTokensTable.tokenHash, tokenHash),
        eq(refreshTokensTable.userId, payload.userId),
        gt(refreshTokensTable.expiresAt, new Date())
      )
    ).limit(1);

    if (!stored || stored.revokedAt) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    // Rotate: revoke old, issue new
    await db.update(refreshTokensTable).set({ revokedAt: new Date() }).where(eq(refreshTokensTable.id, stored.id));

    const newPayload = { userId: payload.userId, role: payload.role };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await db.insert(refreshTokensTable).values({
      userId: payload.userId,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: getRefreshExpiresAt(),
    });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: user ? { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt, lastLoginAt: user.lastLoginAt } : null,
    });
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

router.post("/logout", requireAuth, async (req: AuthRequest, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await db.update(refreshTokensTable).set({ revokedAt: new Date() }).where(
      eq(refreshTokensTable.tokenHash, hashToken(refreshToken))
    );
  }
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
