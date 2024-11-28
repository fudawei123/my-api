const jwt = require("jsonwebtoken");
const { User, LoginRecord } = require("../models");
const { Unauthorized } = require("http-errors");
const { failure } = require("../utils/responses");
const { getKey, setKey } = require("../utils/redis");

module.exports = (isPass = false) => {
  return async (req, res, next) => {
    try {
      // 判断 Token 是否存在
      const { token } = req.headers;
      if (isPass && !token) {
        return next();
      }
      if (!token) {
        throw new Unauthorized("当前接口需要认证才能访问。");
      }

      // 验证 token 是否正确
      const decoded = jwt.verify(token, process.env.SECRET);

      // 从 jwt 中，解析出之前存入的 userId
      const { userId } = decoded;

      const loginRecord = await LoginRecord.findOne({ where: { userId: userId } });
      if(loginRecord){
        if(token !== loginRecord.token ){
          throw new Unauthorized("此账号已在别处登录。");
        }
      }

      // 查询一下，当前用户
      const key = `currentUser:${userId}`;
      let user = await getKey(key);
      if (!user) {
        const user = await User.findByPk(userId);
        if (!user) {
          throw new Unauthorized("用户不存在。");
        }
        await setKey(key, user, 60 * 30);
      }

      // 如果通过验证，将 userId 挂载到 req 上，方便后续中间件或路由使用
      req.userId = userId;
      req.user = user;

      // 一定要加 next()，才能继续进入到后续中间件或路由
      next();
    } catch (error) {
      failure(req, res, error);
    }
  };
};
