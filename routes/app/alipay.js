const express = require("express");
const router = express.Router();
const { User, Order, sequelize } = require("../../models");
const { success, failure } = require("../../utils/responses");
const { NotFound, BadRequest } = require("http-errors");
// const alipaySdk = require("../../utils/alipay");
const userAuth = require("../../middlewares/user-auth");
const moment = require("moment");
const logger = require("../../utils/logger");

/**
 * 支付宝支付
 * POST /alipay/pay/page    电脑页面
 * POST /alipay/pay/wap     手机页面
 */
router.post("/pay/:platform", userAuth, async function (req, res, next) {
    try {
        // 判断是电脑页面，还是手机页面
        const isPC = req.params.platform === "page";
        const method = isPC ? "alipay.trade.page.pay" : "alipay.trade.wap.pay";
        const productCode = isPC ? "FAST_INSTANT_TRADE_PAY" : "QUICK_WAP_WAY";

        // 支付订单信息
        const order = await getOrder(req);
        const { outTradeNo, totalAmount, subject } = order;
        const bizContent = {
            product_code: productCode,
            out_trade_no: outTradeNo,
            subject: subject,
            total_amount: totalAmount,
        };

        // 支付页面接口，返回 HTML 代码片段
        // const html = alipaySdk.pageExecute(method, "GET", {
        //   bizContent,
        //   returnUrl: process.env.ALIPAY_RETURN_URL, // 当支付完成后，支付宝跳转地址
        //   notify_url: process.env.ALIPAY_NOTIFY_URL, // 异步通知回调地址
        // });

        // success(res, "支付地址生成成功", { html });
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 支付宝支付成功后，跳转页面
 * GET /alipay/finish
 */
router.get("/finish", async function (req, res) {
    try {
        const alipayData = req.query;
        const verify = alipaySdk.checkNotifySign(alipayData);

        // 验签成功，更新订单与会员信息
        if (verify) {
            const { out_trade_no, trade_no, timestamp } = alipayData;
            await paidSuccess(out_trade_no, trade_no, timestamp);
            res.redirect("https://clwy.cn/users/course_orders");
            // res.send('支付成功');
        } else {
            throw new BadRequest("支付验签失败。");
        }
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 支付宝异步通知
 * POST /alipay/notify
 */
router.post("/notify", async function (req, res) {
    try {
        const alipayData = req.body;
        const verify = alipaySdk.checkNotifySign(alipayData);

        // 如果验签成功，更新订单与会员信息
        if (verify) {
            const { out_trade_no, trade_no, gmt_payment } = alipayData;
            await paidSuccess(out_trade_no, trade_no, gmt_payment);
            res.send("success");
        } else {
            res.send("fail");
        }
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 主动查询支付宝订单状态
 * POST /alipay/query
 */
router.post("/query", userAuth, async function (req, res) {
    try {
        // 查询订单
        const order = await getOrder(req);

        const result = await alipaySdk.exec("alipay.trade.query", {
            bizContent: {
                out_trade_no: order.outTradeNo,
            },
        });

        // 获取支付结果相关信息
        const { tradeStatus, outTradeNo, tradeNo, sendPayDate } = result;

        // TRADE_SUCCESS 说明支付成功
        if (tradeStatus === "TRADE_SUCCESS") {
            // 更新订单状态
            await paidSuccess(outTradeNo, tradeNo, sendPayDate);
        }

        success(res, "执行成功，请重新查询订单。");
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 支付成功后，更新订单状态和会员信息
 * @param outTradeNo
 * @param tradeNo
 * @param paidAt
 * @returns {Promise<void>}
 */
async function paidSuccess(outTradeNo, tradeNo, paidAt) {
    // 开启事务
    const t = await Order.sequelize.transaction();

    try {
        // 查询当前订单（在事务中）
        const order = await Order.findOne({
            where: { outTradeNo: outTradeNo },
            transaction: t,
        });

        // 对于状态已更新的订单，直接返回。防止用户重复请求，重复增加大会员有效期
        if (order.status > 0) {
            return;
        }

        // 更新订单状态（在事务中）
        await order.update(
            {
                tradeNo: tradeNo, // 流水号
                status: 1, // 订单状态：已支付
                paymentMethod: 0, // 支付方式：支付宝
                paidAt: paidAt, // 支付时间
            },
            { transaction: t }
        );

        // 查询订单对应的用户（在事务中）
        const user = await User.findByPk(order.userId, { transaction: t });

        // 将用户组设置为大会员。可防止管理员创建订单，并将用户组修改为大会员
        if (user.role === 0) {
            user.role = 1;
        }

        // 使用moment.js，增加大会员有效期
        // user.membershipExpiredAt = moment(user.membershipExpiredAt || new Date())
        //   .add(order.membershipMonths, 'months')
        //   .toDate();
        user.membershipExpiredAt = "2025年10月10日";

        // 保存用户信息（在事务中）
        await user.save({ transaction: t });

        // 提交事务
        await t.commit();
    } catch (error) {
        // 回滚事务
        await t.rollback();

        throw error;
    }
}

/**
 * 公共方法：查询当前订单
 * @param req
 * @returns {Promise<*>}
 */
async function getOrder(req) {
    const { outTradeNo } = req.body;
    if (!outTradeNo) {
        throw new BadRequest("订单号不能为空。");
    }

    const order = await Order.findOne({
        where: {
            outTradeNo: outTradeNo,
            userId: req.userId,
        },
    });

    // 用户只能查看自己的订单
    if (!order) {
        throw new NotFound(`订单号: ${outTradeNo} 的订单未找到。`);
    }

    if (order.status > 0) {
        throw new BadRequest("订单已支付或取消。");
    }

    return order;
}

module.exports = router;
