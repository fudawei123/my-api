const express = require('express');
const router = express.Router();
const { User } = require('../../models');
const { success, failure } = require('../../utils/responses');
const validateCaptcha = require('../../middlewares/validate-captcha');
const { delKey } = require('../../utils/redis');
const { emailMQ } = require('../../utils/rabbit-mq');
const authService = require('../../service/Auth.service');

/**
 * 用户注册
 * POST /auth/sign_up
 */
router.post('/sign_up', validateCaptcha, async function (req, res) {
    try {
        const body = {
            email: req.body.email,
            username: req.body.username,
            nickname: req.body.nickname,
            password: req.body.password,
            sex: 2,
            role: 0,
        };

        const user = await User.create(body);
        delete user.dataValues.password; // 删除密码

        // 请求成功，删除验证码，防止重复使用
        await delKey(req.body.captchaKey);

        // 将邮件发送请求放入队列
        const msg = {
            to: user.email,
            subject: '注册成功通知',
            html: `
                您好，<span style="color: red">${user.nickname}</span>。<br><br>
                恭喜，您已成功注册会员！
            `,
        };

        emailMQ.producer(msg);

        success(res, '创建用户成功。', { user }, 201);
    } catch (error) {
        failure(req, res, error);
    }
});

/**
 * 用户登录
 * POST /auth/sign_in
 */
router.post('/sign_in', async (req, res) => {
    try {
        const token = await authService.signIn(req.body);

        success(res, '登录成功。', token);
    } catch (error) {
        failure(req, res, error);
    }
});

module.exports = {
    router,
    grpc: {
        signIn: async (call, callback) => {
            try {
                console.log('call.request:', call.request);
                const token = await authService.signIn(call.request);
                console.log('token:', token);
                callback(null, { code: 200, message: '', token });
            } catch (error) {
                callback(null, {
                    code: 500,
                    message: error.message,
                    token: '',
                });
            }
        },
    },
};
