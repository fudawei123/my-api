const express = require('express');
const router = express.Router();
const { Article } = require('../../models');
const { Op } = require('sequelize');
const { success, failure } = require('../../utils/responses');
const { NotFound } = require('http-errors');
const { getKeysByPattern, delKey } = require('../../utils/redis');
const articleService = require('../../service/Article.service');

/**
 * 查询文章列表
 * GET /admin/articles
 */
router.get('/', async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        const condition = {
            where: {},
            order: [['id', 'DESC']],
            limit: pageSize,
            offset: offset,
        };

        // 查询被软删除的数据
        if (query.deleted === 'true') {
            condition.paranoid = false;
            condition.where.deletedAt = {
                [Op.not]: null,
            };
        }

        if (query.title) {
            condition.where.title = {
                [Op.like]: `%${query.title}%`,
            };
        }

        const { count, rows } = await articleService.findAndCountAll(condition);

        success(res, '查询文章列表成功。', {
            list: rows,
            total: count,
            currentPage,
            pageSize,
        });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 查询文章详情
 * GET /admin/articles/:id
 */
router.get('/:id', async function (req, res) {
    try {
        const article = await articleService.findByPk(req.params.id);

        success(res, '查询文章成功。', article);
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 创建文章
 * POST /admin/articles
 */
router.post('/', async function (req, res) {
    try {
        const body = filterBody(req);

        const article = await articleService.create(body);

        await clearCache();

        success(res, '创建文章成功。', article, 201);
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 删除文章
 * POST /admin/articles/:id
 */
router.delete('/:id', async function (req, res) {
    try {
        const { id } = req.params;

        await articleService.destroy(id);

        await clearCache(id);

        success(res, '删除文章成功。');
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 更新文章
 * PUT /admin/articles/:id
 */
router.put('/:id', async function (req, res) {
    try {
        const { id } = req.params;
        const body = filterBody(req);

        await articleService.update(id, body);

        await clearCache(id);

        success(res, '更新文章成功。');
    } catch (error) {
        failure(req, res, error);
    }
});

// 待测试
router.post('/createOrUpdate', async function (req, res) {
    try {
        const id = req.body.id;
        const body = filterBody(req);

        let article;
        if (id) {
            article = await getArticle(req);
            await article.update(body);
        } else {
            article = await Article.create(body);
        }

        success(res, `${id ? '更新' : '创建'}文章成功。`, { article });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 删除到回收站
 * POST /admin/articles/delete
 */
router.post('/delete', async function (req, res) {
    try {
        const { id } = req.body;

        await Article.destroy({ where: { id: id } });

        await clearCache(id);

        success(res, '已删除到回收站。');
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 从回收站恢复
 * POST /admin/articles/restore
 */
router.post('/restore', async function (req, res) {
    try {
        const { id } = req.body;

        await Article.restore({ where: { id: id } });

        await clearCache(id);

        success(res, '已恢复成功。');
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 彻底删除
 * POST /admin/articles/force_delete
 */
router.post('/force_delete', async function (req, res) {
    try {
        const { id } = req.body;

        await Article.destroy({
            where: { id: id },
            force: true,
        });
        success(res, '已彻底删除。');
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 公共方法：查询当前文章
 */
async function getArticle(req) {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
        throw new NotFound(`ID: ${id}的文章未找到。`);
    }

    return article;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{title, content: (string|string|DocumentFragment|*)}}
 */
function filterBody(req) {
    return {
        title: req.body.title,
        content: req.body.content,
    };
}

/**
 * 清除缓存
 * @param id
 * @returns {Promise<void>}
 */
async function clearCache(id = null) {
    // 清除所有文章列表缓存
    let keys = await getKeysByPattern('articles:*');
    if (keys.length !== 0) {
        await delKey(keys);
    }

    // 如果传递了id，则通过id清除文章详情缓存
    if (id) {
        // 如果是数组，则遍历
        const keys = Array.isArray(id)
            ? id.map((item) => `article:${item}`)
            : `article:${id}`;
        await delKey(keys);
    }
}

module.exports = router;
