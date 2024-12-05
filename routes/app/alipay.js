const express = require("express");
const router = express.Router();
const { User, Order } = require("../../models");
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
    //   returnUrl: `https://demo.clwy.cn/alipay/return`, // 当支付完成后，支付宝跳转地址
    //   notify_url: "https://api.clwy.cn/alipay/notify", // 异步通知回调地址
    // });

    // success(res, "支付地址生成成功", { html });
  } catch (error) {
    failure(res, error);
  }
});

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

  if (order.status > 1) {
    throw new BadRequest("订单已经支付或失效，无法付款。");
  }

  return order;
}

module.exports = router;
