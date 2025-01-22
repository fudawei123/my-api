const express = require('express');
const router = express.Router();

const { sequelize, User } = require('../../models');
const { success, failure } = require('../../utils/responses');
const { Worker } = require('worker_threads');

// 创建一个新的Worker Thread
const worker = new Worker('./worker.js');

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

        success(res, '查询每月用户数量成功。', { data });

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
    } catch (error) {
        failure(req, res, error);
    }
});

// const sleep = (milliseconds) => {
//     const start = Date.now();
//     while (Date.now() - start < milliseconds) {
//         // 什么也不做，只是等待
//     }
// };
router.get('test_block', (res) => {
    // sleep(10000);
    // res.send('done');

    // 向Worker Thread发送消息
    worker.postMessage(10000);

    // 接收来自Worker Thread的消息
    worker.on('message', (message) => {
        res.send(message);
    });

    // 监听Worker Thread的错误事件
    worker.on('error', (error) => {
        console.error(`Worker error: ${error}`);
    });

    // 监听Worker Thread的退出事件
    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
});

module.exports = router;
