const express = require("express");
const router = express.Router();

const userAuth = require("../../middlewares/user-auth");
const homeRouter = require("./home");
const categoriesRouter = require("./categories");
const coursesRouter = require("./courses");
const chaptersRouter = require("./chapters");
const articlesRouter = require("./articles");
const settingsRouter = require("./settings");
const searchRouter = require("./search");
const authRouter = require("./auth");
const usersRouter = require("./users");
const likesRouter = require("./likes");
const postsRouter = require("./posts");
const uploadsRouter = require("./uploads");
const captchaRouter = require("./captcha");
const commentsRouter = require("./comments");
const membershipsRouter = require("./memberships");
const ordersRouter = require("./orders");

router.use("/", homeRouter);
router.use("/categories", categoriesRouter);
router.use("/courses", userAuth(true), coursesRouter);
router.use("/chapters", userAuth(true), chaptersRouter);
router.use("/articles", articlesRouter);
router.use("/settings", settingsRouter);
router.use("/search", searchRouter);
router.use("/auth", authRouter);
router.use("/users", userAuth(), usersRouter);
router.use("/likes", userAuth(), likesRouter);
router.use("/posts", postsRouter);
router.use("/uploads", userAuth(), uploadsRouter);
router.use("/captcha", captchaRouter);
router.use("/comments", commentsRouter);
router.use("/memberships", membershipsRouter);
router.use("/orders", userAuth(), ordersRouter);

module.exports = router;