const express = require("express");
const router = express.Router();
const {Op} = require("sequelize");
const {success, failure} = require("../../utils/responses");
const {NotFound, Conflict} = require("http-errors");
const {Course, Category, User, Chapter, Attachment, sequelize} = require("../../models");
const {getKeysByPattern, delKey} = require('../../utils/redis');
const recordAttachment = require("../../utils/recordAttachment");

/**
 * 查询课程列表
 * GET /admin/courses
 */
router.get("/", async function (req, res) {
    try {
        const query = req.query;
        const currentPage = Math.abs(Number(query.currentPage)) || 1;
        const pageSize = Math.abs(Number(query.pageSize)) || 10;
        const offset = (currentPage - 1) * pageSize;

        const condition = {
            ...getCondition(),
            where: {},
            order: [["id", "DESC"]],
            limit: pageSize,
            offset: offset,
        };

        if (query.categoryId) {
            condition.where.categoryId = query.categoryId;
        }

        if (query.userId) {
            condition.where.userId = query.userId;
        }

        if (query.name) {
            condition.where.name = {
                [Op.like]: `%${query.name}%`,
            };
        }

        if (query.recommended) {
            condition.where.recommended = query.recommended === "true";
        }

        if (query.introductory) {
            condition.where.introductory = query.introductory === "true";
        }

        const {count, rows} = await Course.findAndCountAll(condition);
        success(res, "查询课程列表成功。", {
            courses: rows,
            pagination: {
                total: count,
                currentPage,
                pageSize,
            },
        });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 查询课程详情
 * GET /admin/courses/:id
 */
router.get("/:id", async function (req, res) {
    try {
        const course = await getCourse(req);
        success(res, "查询课程成功。", {course});
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 创建课程
 * POST /admin/courses
 */
router.post("/", async function (req, res) {
    try {
        const [attachment, ...attachments] = await recordAttachment([req.body.banner, ...req.body.files])
        const body = filterBody(req);
        body.userId = req.user.id;
        body.attachmentId = attachment.id;
        body.attachmentIds = attachments.map(item => item.id).join(',')
        const course = await Course.create(body);

        await clearCache();

        success(res, "创建课程成功。", course, 201);
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 删除课程
 * POST /admin/courses/:id
 */
router.delete("/:id", async function (req, res) {
    try {
        const course = await getCourse(req);

        const count = await Chapter.count({where: {courseId: req.params.id}});
        if (count > 0) {
            throw new Conflict("当前课程有章节，无法删除。");
        }

        await Attachment.destroy({
            where: {
                id: {
                    [Op.in]: [course.attachmentId, ...course.attachmentIds.split(',')]
                }
            }
        })

        await course.destroy();

        await clearCache(course);

        success(res, "删除课程成功。");
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 更新课程
 * PUT /admin/courses/:id
 */
router.put("/:id", async function (req, res) {
    try {
        const course = await getCourse(req);
        const body = filterBody(req);

        await Attachment.destroy({
            where: {
                id: {
                    [Op.in]: [course.attachmentId, ...course.attachmentIds.split(',')]
                }
            }
        })
        const [attachment, ...attachments] = await recordAttachment([req.body.banner, ...req.body.files])
        body.attachmentId = attachment.id;
        body.attachmentIds = attachments.map(item => item.id).join(',')
        await course.update(body);

        await clearCache(course);

        success(res, "更新课程成功。", {course});
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 同步章节数量到课程表里
 * PUT /admin/courses
 */
router.put("/", async function (req, res) {
    try {
        const [results] = await sequelize.query(
            "SELECT courseId, COUNT(*) as chaptersCount FROM Chapters GROUP BY courseId"
        );
        const map = results.reduce((map, item) => {
            map[item.courseId] = item.chaptersCount;
            return map;
        }, {});
        const courses = await Course.findAll({
            where: {
                id: {
                    [Op.in]: results.map((item) => item.courseId),
                },
            },
        });
        for (let index = 0; index < courses.length; index++) {
            const course = courses[index];
            course.chaptersCount = map[course.id];
            await course.save();
        }

        success(res, "批量更新课程成功。", {courses});
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 公共方法：关联分类、用户数据
 * @returns {{include: [{as: string, model, attributes: string[]}], attributes: {exclude: string[]}}}
 */
function getCondition() {
    return {
        distinct: true,
        attributes: {exclude: ["CategoryId", "UserId"]},
        include: [
            {
                model: Category,
                as: "category",
                attributes: ["id", "name"],
            },
            {
                model: User,
                as: "user",
                attributes: ["id", "username", "avatar"],
            },
            {
                model: Chapter,
                as: "chapters",
                attributes: ["id", "title"],
            },
        ],
    };
}

/**
 * 公共方法：查询当前课程
 */
async function getCourse(req) {
    const {id} = req.params;
    const condition = getCondition();

    const course = await Course.findByPk(id, condition);
    if (!course) {
        throw new NotFound(`ID: ${id}的课程未找到。`);
    }

    return course;
}

/**
 * 公共方法：白名单过滤
 * @param req
 * @returns {{image: *, name, introductory: (boolean|*), categoryId: (number|*), content, recommended: (boolean|*)}}
 */
function filterBody(req) {
    return {
        categoryId: req.body.categoryId,
        name: req.body.name,
        image: req.body.image,
        recommended: req.body.recommended,
        introductory: req.body.introductory,
        content: req.body.content,
        free: req.body.free
    };
}

/**
 * 清除缓存
 * @param course
 * @returns {Promise<void>}
 */
async function clearCache(course = null) {
    let keys = await getKeysByPattern("courses:*");
    if (keys.length !== 0) {
        await delKey(keys);
    }

    if (course) {
        await delKey(`course:${course.id}`);
    }
}

module.exports = router;
