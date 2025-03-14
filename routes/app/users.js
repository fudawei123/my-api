const express = require('express');
const router = express.Router();
const { BadRequest, NotFound } = require('http-errors');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const {
    User,
    Like,
    Course,
    Attachment,
    sequelize,
    Comment,
} = require('../../models');
const { success, failure } = require('../../utils/responses');
const { setKey, getKey, delKey } = require('../../utils/redis');

/**
 * 查询当前登录用户详情
 * GET /users/me
 */
router.get('/me', async function (req, res) {
    try {
        let user = await getKey(`user:${req.userId}`);
        if (!user) {
            user = await getUser(req);
            user = user.toJSON();
            await setKey(`user:${req.userId}`, user);
        }

        const likesCount = await Like.count({
            where: {
                userId: req.userId,
            },
        });

        success(res, '查询当前用户信息成功。', {
            user: { ...user, likesCount },
        });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 更新用户信息
 * PUT /users/info
 */
router.put('/info', async function (req, res) {
    try {
        const body = {
            nickname: req.body.nickname,
            sex: req.body.sex,
            company: req.body.company,
            introduce: req.body.introduce,
            avatar: req.body.avatar,
        };

        const user = await getUser(req);
        await user.update(body);

        await clearCache(user);

        success(res, '更新用户信息成功。', { user });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 更新账户信息
 * PUT /users/account
 */
router.put('/account', async function (req, res) {
    try {
        const body = {
            email: req.body.email,
            username: req.body.username,
            currentPassword: req.body.currentPassword,
            password: req.body.password,
            passwordConfirmation: req.body.passwordConfirmation,
        };

        if (!body.currentPassword) {
            throw new BadRequest('当前密码必须填写。');
        }

        if (body.password !== body.passwordConfirmation) {
            throw new BadRequest('两次输入的密码不一致。');
        }

        // 加上 true 参数，可以查询到加密后的密码
        const user = await getUser(req, true);

        // 验证当前密码是否正确
        const isPasswordValid = bcrypt.compareSync(
            body.currentPassword,
            user.password
        );
        if (!isPasswordValid) {
            throw new BadRequest('当前密码不正确。');
        }

        await user.update(body);

        // 删除密码
        delete user.dataValues.password;

        await clearCache(user);

        success(res, '更新账户信息成功。', { user });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 查询用户点赞过的课程
 */
router.get('/likeCourses', async function (req, res) {
    // sql
    try {
        const likeCourses = await Like.findAll({
            where: { userId: req.user.id },
        });

        const ids = likeCourses.map((item) => item.courseId);
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        const condition = {
            attributes: { exclude: ['CategoryId', 'UserId', 'content'] },
            include: [
                {
                    model: Attachment,
                    as: 'attachment',
                },
                {
                    model: User,
                    as: 'user',
                    attributes: { exclude: ['password'] },
                },
            ],
            where: {
                id: {
                    [Op.in]: ids,
                },
            },
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset,
        };
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
        success(res, '查询用户点赞过的课程成功。', data);
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 查询回复的评论
 */
router.get('/replyComments', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        const [results] = await sequelize.query(`
            SELECT c1.text as my_text, c2.*, u.avatar, u.username 
            FROM (SELECT * FROM Comments WHERE userId = ${req.userId}) c1 
            INNER JOIN (SELECT * FROM Comments WHERE replyId IS NOT NULL) c2 ON c1.id = c2.replyId
            LEFT JOIN Users u ON u.id = c2.userId
            ORDER BY c2.createdAt DESC
        `);

        const ids = results.map((item) => item.id);
        const replyComments = await Comment.findAll({
            where: {
                replyId: {
                    [Op.in]: ids,
                },
            },
            order: [['createdAt', 'DESC']],
        });
        const list = JSON.parse(JSON.stringify(replyComments));
        const replyIds = [];
        for (const item of list) {
            const { replyId, userId } = item;
            if (req.userId === userId) {
                replyIds.push(replyId);
            }
        }

        const count = results.length;
        const rows = results.slice(offset, offset + pageSize);
        rows.forEach((item) => {
            item.isReply = replyIds.includes(item.id);
        });
        const data = {
            list: rows,
            total: count,
            currentPage,
            pageSize,
        };

        success(res, '查询回复的评论成功。', data);
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 公共方法：查询当前用户
 * @param req
 * @param showPassword
 * @returns {Promise<Model<any, TModelAttributes>>}
 */
async function getUser(req, showPassword = false) {
    const id = req.userId;

    let condition = {};
    if (!showPassword) {
        condition = {
            attributes: { exclude: ['password'] },
        };
    }

    const user = await User.findByPk(id, condition);
    if (!user) {
        throw new NotFound(`ID: ${id}的用户未找到。`);
    }

    return user;
}

/**
 * 清除缓存
 * @param user
 * @returns {Promise<void>}
 */
async function clearCache(user) {
    await delKey(`user:${user.id}`);
}

module.exports = router;
