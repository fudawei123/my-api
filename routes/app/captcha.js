const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');
const { v4: uuidv4 } = require('uuid');
const { success, failure } = require('../../utils/responses');
const { setKey } = require('../../utils/redis');

/**
 * 获取验证码
 * GET /captcha
 */
router.get('/', async (req, res) => {
    try {
        // const captcha = svgCaptcha.create();
        const captcha = svgCaptcha.create({
            size: 4, // 验证码长度
            ignoreChars: '0o1iq9uv', // 验证码字符中排除 0o1iq9uv
            noise: 3, // 干扰线条数量
            color: true, // 是否有颜色，
            width: 100, // 宽
            height: 40, // 高
        });
        // const captcha = svgCaptcha.createMathExpr({
        //   size: 4, // 验证码长度
        //   ignoreChars: "0o1iq9uv", // 验证码字符中排除 0o1iq9uv
        //   noise: 3, // 干扰线条数量
        //   color: true, // 是否有颜色，
        //   width: 100, // 宽
        //   height: 40, // 高
        // });

        const captchaKey = `captcha:${uuidv4()}`;
        await setKey(captchaKey, captcha.text, 60);

        success(res, '验证码获取成功。', {
            captchaKey,
            captchaData: captcha.data,
        });
    } catch (error) {
        failure(req, res, error);
    }
});

module.exports = router;
