const express = require("express");
const router = express.Router();

const adminAuth = require("../middlewares/admin-auth");
const adminRouter = require("./admin");
const appRouter = require("./app");

router.use("/admin", adminAuth, adminRouter);
router.use("/", appRouter);

module.exports = router;