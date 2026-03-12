import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import publicRouter from "./public.js";
import adminCategoriesRouter from "./admin/categories.js";
import adminUsersRouter from "./admin/users.js";
import adminNewsRouter from "./admin/news.js";
import adminBannersRouter from "./admin/banners.js";
import adminVideosRouter from "./admin/videos.js";
import adminSettingsRouter from "./admin/settings.js";
import adminDashboardRouter from "./admin/dashboard.js";
import adminAuditRouter from "./admin/audit.js";
import adminUploadRouter from "./admin/upload.js";
import adminInstagramVideosRouter from "./admin/instagram-videos.js";
import adminColumnistsRouter from "./admin/columnists.js";
import adminProgramsRouter from "./admin/programs.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/public", publicRouter);
router.use("/admin/categories", adminCategoriesRouter);
router.use("/admin/users", adminUsersRouter);
router.use("/admin/news", adminNewsRouter);
router.use("/admin/banners", adminBannersRouter);
router.use("/admin/videos", adminVideosRouter);
router.use("/admin/instagram-videos", adminInstagramVideosRouter);
router.use("/admin/columnists", adminColumnistsRouter);
router.use("/admin/programs", adminProgramsRouter);
router.use("/admin/settings", adminSettingsRouter);
router.use("/admin/dashboard", adminDashboardRouter);
router.use("/admin/audit-logs", adminAuditRouter);
router.use("/admin/upload", adminUploadRouter);

export default router;
