const express = require("express");
const router = express.Router();
const { Course, Like, User, sequelize } = require("../models");
const { success, failure } = require("../utils/responses");
const { NotFound } = require('http-errors');

/**
 * 点赞、取消赞
 * POST /likes
 */
router.post("/", async function (req, res) {
  // 首先, 我们从你的连接开始一个事务并将其保存到一个变量中
  const t = await sequelize.transaction();

  try {
    const userId = req.userId;
    const { courseId } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new NotFound("课程不存在。");
    }

    // 检查课程之前是否已经点赞
    const like = await Like.findOne({
      where: {
        courseId,
        userId,
      },
    });

    // 如果没有点赞过，那就新增。并且课程的 likesCount + 1
    if (!like) {
      await Like.create({ courseId, userId }, { transaction: t });
      await course.increment("likesCount", { transaction: t });

      // 如果执行到此行,且没有引发任何错误.
      // 我们提交事务.
      await t.commit();

      success(res, "点赞成功。");
    } else {
      // 如果点赞过了，那就删除。并且课程的 likesCount - 1
      await like.destroy({ transaction: t });
      await course.decrement("likesCount", { transaction: t });

      // 如果执行到此行,且没有引发任何错误.
      // 我们提交事务.
      await t.commit();

      success(res, "取消赞成功。");
    }
  } catch (error) {
    // 如果执行到达此行,则抛出错误.
    // 我们回滚事务.
    await t.rollback();

    failure(req, res, error);
  }
});

/**
 * 查询用户点赞的课程
 * GET /likes
 */
router.get("/", async function (req, res) {
  try {
    const query = req.query;
    const currentPage = Math.abs(Number(query.currentPage)) || 1;
    const pageSize = Math.abs(Number(query.pageSize)) || 10;
    const offset = (currentPage - 1) * pageSize;

    // 查询当前用户
    const user = await User.findByPk(req.userId);

    // 查询当前用户点赞过的课程
    const courses = await user.getLikeCourses({
      joinTableAttributes: [],
      attributes: { exclude: ["CategoryId", "UserId", "content"] },
      order: [["id", "DESC"]],
      limit: pageSize,
      offset: offset,
    });

    // 查询当前用户点赞过的课程总数
    const count = await user.countLikeCourses();

    success(res, "查询用户点赞的课程成功。", {
      courses,
      pagination: {
        total: count,
        currentPage,
        pageSize,
      },
    });

    // // 通过用户查询点赞的课程
    // const user = await User.findByPk(req.userId, {
    //   include: {
    //     model: Course,
    //     as: "likeCourses",
    //   },
    // });
    // success(res, "查询当前用户点赞的课程成功。", user);

    // // 通过课程查询点赞的用户
    // const course = await Course.findByPk(2, {
    //   include: {
    //     model: User,
    //     as: "likeUsers",
    //   },
    // });
    // success(res, "查询当前课程点赞的用户成功。", course);
  } catch (error) {
    failure(req, res, error);
  }
});

module.exports = router;
