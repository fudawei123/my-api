const express = require("express");
const router = express.Router();
const {Op} = require("sequelize");

const {Course, Like, Attachment, User} = require("../../models");
const {success, failure} = require("../../utils/responses");
const {search} = require("../../utils/meilisearch");

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
            attributes: {exclude: ["CategoryId", "UserId", "content"]},
            include: [
                {
                    model: Attachment,
                    as: "attachment",
                },
                {
                    model: User,
                    as: "user",
                    attributes: {exclude: ["password"]},
                },
            ],
            order: [["id", "DESC"]],
            limit: pageSize,
            offset: offset,
        };
        let list, total;
        if (query.name) {
            const searchRes = await search(query.name);
            if (searchRes.hits.length > 0) {
                const map = searchRes.hits.reduce((map, hit) => {
                    return {
                        ...map,
                        [hit.id]: hit._formatted.name,
                    }
                }, {})
                const ids = searchRes.hits.map((item) => item.id);
                condition.where.id = {
                    [Op.in]: ids,
                };
                const {count, rows} = await Course.findAndCountAll(condition);
                list = rows.map(item => {
                    return {
                        ...item,
                        name: map[item.id]
                    }
                });
                total = count;
            } else {
                list = [];
                total = 0;
            }
        } else {
            const {count, rows} = await Course.findAndCountAll(condition);
            list = rows;
            total = count;
        }

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
            list = list.map((item) => {
                return {
                    ...item,
                    isLike: courseIds.includes(item.id)
                }
            })
        }
        const data = {
            list: list,
            total: total,
            currentPage,
            pageSize,
        };
        success(res, "搜索课程成功。", data);
    } catch (error) {
        failure(req, res, error);
    }
});

module.exports = router;
