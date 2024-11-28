const express = require("express");
const router = express.Router();

const adminArticlesRouter = require("./articles");
const adminCategoriesRouter = require("./categories");
const adminSettingsRouter = require("./settings");
const adminUsersRouter = require("./users");
const adminCoursesRouter = require("./courses");
const adminChaptersRouter = require("./chapters");
const adminChartsRouter = require("./charts");
const adminAuthRouter = require("./auth");
const adminAttachmentsRouter = require("./attachments");
const adminMembershipsRouter = require("./memberships");
const adminOrdersRouter = require("./orders");

router.use("/articles", adminArticlesRouter);
router.use("/categories", adminCategoriesRouter);
router.use("/settings", adminSettingsRouter);
router.use("/users", adminUsersRouter);
router.use("/courses", adminCoursesRouter);
router.use("/chapters", adminChaptersRouter);
router.use("/charts", adminChartsRouter);
router.use("/auth", adminAuthRouter);
router.use("/attachments", adminAttachmentsRouter);
router.use("/memberships", adminMembershipsRouter);
router.use("/orders", adminOrdersRouter);

module.exports = router;
