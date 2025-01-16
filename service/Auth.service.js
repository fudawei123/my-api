const { BadRequest, NotFound, Unauthorized } = require('http-errors');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('./user.service');

class AuthService {
    signUp() {}

    async signIn(body) {
        const { login, password } = body;

        if (!login) {
            throw new BadRequest('邮箱/用户名必须填写。');
        }

        if (!password) {
            throw new BadRequest('密码必须填写。');
        }

        const condition = {
            where: {
                [Op.or]: [{ email: login }, { username: login }],
            },
        };

        // 通过email或username，查询用户是否存在
        const user = await userService.findOne(condition);
        if (!user) {
            throw new NotFound('用户不存在，无法登录。');
        }

        // 验证密码
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            throw new Unauthorized('密码错误。');
        }

        // 生成身份验证令牌
        const token = jwt.sign(
            {
                userId: user.id,
            },
            process.env.SECRET,
            { expiresIn: '30d' }
        );

        return token;

        // const loginRecord = await LoginRecord.findOne({
        //     where: { userId: user.id },
        // });
        // if (loginRecord) {
        //     await loginRecord.update({ token: token });
        // } else {
        //     await LoginRecord.create({
        //         userId: user.id,
        //         token: token,
        //     });
        // }
    }
}

module.exports = new AuthService();
