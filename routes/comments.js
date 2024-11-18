const express = require("express");
const router = express.Router();
const {Comment, sequelize} = require("../models");
const {success, failure} = require("../utils/responses");
const {NotFound} = require("http-errors");
const {setKey, getKey, delKey} = require("../utils/redis");

/**
 * 查询评论列表
 * GET /comments
 */
router.get("/", async function (req, res) {
    try {
        const query = req.query;
        const courseId = query.courseId;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        const cacheKey = `comments:${courseId}`;
        let data = await getKey(cacheKey);
        if (data) {
            return success(res, "查询评论列表成功。", data);
        }
        const [results] = await sequelize.query(`
            SELECT c1.id, c1.text, c1.parentId, c1.replyId, u1.id as userId, u1.username as username, u1.avatar as avatar, u2.avatar as replyAvatar, u2.id as replyUserId, u2.username as replyUsername
            FROM (SELECT * FROM Comments WHERE courseId = ${courseId}) as c1
            LEFT JOIN Comments c2 ON c1.replyId = c2.id
            LEFT JOIN Users u1 ON c1.userId = u1.id
            LEFT JOIN Users u2 ON c2.userId = u2.id
            ORDER BY c1.createdAt ASC
        `)

        const parent = []
        const children = {}
        for (let i = 0; i < results.length; i++) {
            const item = results[i]
            if (item.parentId) {
                const parentId = item.parentId
                if (!children[parentId]) {
                    children[parentId] = []
                }
                children[parentId].push(item)
            } else {
                parent.push(item)
            }
        }
        for (let i = 0; i < parent.length; i++) {
            const item = parent[i]
            if (children[item.id]) {
                item.children = children[item.id]
            }
        }

        const count = parent.length
        const rows = parent.slice(offset, offset + pageSize)
        data = {
            list: rows,
            total: count,
            currentPage,
            pageSize,
        };
        await setKey(cacheKey, data);

        success(res, "查询评论列表成功。", data);
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 创建评论
 * POST /comments
 */
router.post("/", async function (req, res) {
    try {
        const body = filterBody(req);

        const comment = await Comment.create(body);

        await delKey(`comments:${body.courseId}`)

        success(res, "创建评论成功。", comment, 201);
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns
 */
function filterBody(req) {
    return {
        userId: req.userId,
        courseId: req.body.courseId,
        parentId: req.body.parentId,
        replyId: req.body.replyId,
        address: req.body.address,
        text: req.body.text,
    };
}

module.exports = router;
