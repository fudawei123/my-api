const cors = require("cors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

const adminAuth = require("./middlewares/admin-auth");
const userAuth = require("./middlewares/user-auth");
const rateLimiter = require('./middlewares/rateLimiter')

const indexRouter = require("./routes/index");
const categoriesRouter = require("./routes/categories");
const coursesRouter = require("./routes/courses");
const chaptersRouter = require("./routes/chapters");
const articlesRouter = require("./routes/articles");
const settingsRouter = require("./routes/settings");
const searchRouter = require("./routes/search");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const likesRouter = require("./routes/likes");
const postsRouter = require("./routes/posts");
const uploadsRouter = require("./routes/uploads");
const captchaRouter = require("./routes/captcha");
const commentsRouter = require("./routes/comments");
const membershipsRouter = require('./routes/memberships');

// 后台路由文件
const adminArticlesRouter = require("./routes/admin/articles");
const adminCategoriesRouter = require("./routes/admin/categories");
const adminSettingsRouter = require("./routes/admin/settings");
const adminUsersRouter = require("./routes/admin/users");
const adminCoursesRouter = require("./routes/admin/courses");
const adminChaptersRouter = require("./routes/admin/chapters");
const adminChartsRouter = require("./routes/admin/charts");
const adminAuthRouter = require("./routes/admin/auth");
const adminAttachmentsRouter = require("./routes/admin/attachments");
const adminMembershipsRouter = require('./routes/admin/memberships');

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// CORS 跨域配置
app.use(cors());
// const corsOptions = {
//   origin: "https://clwy.cn",
// };
// const corsOptions = {
//   origin: ["https://clwy.cn", "http://127.0.0.1:5500"],
// };
// app.use(cors(corsOptions));

app.use("/", indexRouter);
app.use("/categories", categoriesRouter);
app.use("/courses", rateLimiter, coursesRouter);
app.use("/chapters", chaptersRouter);
app.use("/articles", articlesRouter);
app.use("/settings", settingsRouter);
app.use("/search", searchRouter);
app.use("/auth", authRouter);
app.use("/users", userAuth, usersRouter);
app.use("/likes", userAuth, likesRouter);
app.use("/posts", postsRouter);
app.use("/uploads", userAuth, uploadsRouter);
app.use("/captcha", captchaRouter);
app.use("/comments", commentsRouter)
app.use('/memberships', membershipsRouter);

// 后台路由配置
app.use("/admin/articles", adminAuth, adminArticlesRouter);
app.use("/admin/categories", adminAuth, adminCategoriesRouter);
app.use("/admin/settings", adminAuth, adminSettingsRouter);
app.use("/admin/users", adminAuth, adminUsersRouter);
app.use("/admin/courses", adminAuth, adminCoursesRouter);
app.use("/admin/chapters", adminAuth, adminChaptersRouter);
app.use("/admin/charts", adminAuth, adminChartsRouter);
app.use("/admin/auth", adminAuthRouter);
app.use("/admin/attachments", adminAttachmentsRouter);
app.use('/admin/memberships', adminAuth, adminMembershipsRouter);

module.exports = app;
