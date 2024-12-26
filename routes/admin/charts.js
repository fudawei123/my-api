const express = require('express');
const router = express.Router();
const { sequelize, User } = require('../../models');
const { Op } = require('sequelize');
const { success, failure } = require('../../utils/responses');
const { NotFound } = require('http-errors');

/**
 * 统计用户性别
 * GET /admin/charts/sex
 */
router.get('/sex', async function (req, res) {
    try {
        const [male, female, unknown] = await Promise.all([
            User.count({ where: { sex: 0 } }),
            User.count({ where: { sex: 1 } }),
            User.count({ where: { sex: 2 } }),
        ]);

        const data = [
            { value: male, name: '男性' },
            { value: female, name: '女性' },
            { value: unknown, name: '未选择' },
        ];

        success(res, '查询用户性别成功。', { data });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 统计每个月用户数量
 * GET /admin/charts/user
 */
router.get('/user', async (req, res) => {
    try {
        const [results] = await sequelize.query(
            "SELECT DATE_FORMAT(`createdAt`, '%Y-%m') AS `month`, COUNT(*) AS `value` FROM `Users` GROUP BY `month` ORDER BY `month` ASC"
        );

        const data = {
            months: [],
            values: [],
        };

        results.forEach((item) => {
            data.months.push(item.month);
            data.values.push(item.value);
        });

        // const results = await User.findAll({
        //   attributes: [
        //     [
        //       sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
        //       "month",
        //     ], // 使用 DATE_FORMAT 转换日期格式
        //     [sequelize.fn("COUNT", "*"), "value"], // 统计每个月的用户数量
        //   ],
        //   group: ["month"], // 按年月分组
        //   order: [["month", "ASC"]], // 按年月排序,
        //   raw: true,
        // });

        success(res, '查询每月用户数量成功。', { data });
    } catch (err) {
        failure(req, res, error);
    }
});

module.exports = router;
