const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");

const { Course, Like, Attachment, User } = require("../../models");
const { success, failure } = require("../../utils/responses");
const { search } = require("../../utils/meilisearch");

/**
 * 搜索课程
 * GET /search
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    const condition = {
      where: {},
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      include: [
        {
          model: Attachment,
          as: "attachment",
        },
        {
          model: User,
          as: "user",
          attributes: { exclude: ["password"] },
        },
      ],
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    };
    if (query.name) {
      const ids = search(query.name);
      condition.where.id = {
        [Op.in]: ids,
      };
    }
    const { count, rows } = await Course.findAndCountAll(condition);
    const list = JSON.parse(JSON.stringify(rows));

    if (req.userId) {
      const ids = list.map((item) => item.id);
      const likes = await Like.findAll({
        where: {
          userId: req.userId,
          courseId: {
            [Op.in]: ids,
          },
        },
      });
      const courseIds = likes.map((item) => item.courseId);
      list.forEach((item) => {
        item.isLike = courseIds.includes(item.id);
      });
    }

    const data = {
      list: list,
      total: count,
      currentPage,
      pageSize,
    };
    success(res, "搜索课程成功。", data);
  } catch (error) {
    failure(req, res, error);
  }
});

module.exports = router;
