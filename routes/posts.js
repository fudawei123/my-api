const express = require("express");
const router = express.Router();
const { Post, Category } = require("../models");
const { success, failure } = require("../utils/responses");

/**
 * GET /posts
 */
router.get("/", async function (req, res) {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });
    success(res, "查询成功。", { posts });
  } catch (error) {
    failure(req, res, error);
  }
});

module.exports = router;
