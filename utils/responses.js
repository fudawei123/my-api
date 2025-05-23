const createError = require('http-errors');
const multer = require('multer');
const logger = require('./logger');

/**
 * 请求成功
 * @param res
 * @param message
 * @param data
 * @param code
 */
function success(res, message, data = {}, code = 200) {
    res.status(code).json({
        status: true,
        message,
        data,
    });
}

/**
 * 请求失败
 * @param res
 * @param error
 */
function failure(req, res, error) {
    // 默认响应为 500，服务器错误
    let statusCode = 500;
    let errors = '服务器错误';

    if (error.name === 'SequelizeValidationError') {
        // Sequelize 验证数据错误
        statusCode = 400;
        errors = error.errors.map((e) => e.message);
    } else if (error.name === 'SequelizeOptimisticLockError') {
        statusCode = 409;
        errors = '请求冲突，您提交的数据已被修改，请稍后重试。';
    } else if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
    ) {
        // Token 验证错误
        statusCode = 401;
        errors = '您提交的 token 错误或已过期。';
    } else if (error instanceof createError.HttpError) {
        // http-errors 库创建的错误
        statusCode = error.status;
        errors = error.message;
    } else if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            statusCode = 413;
            errors = '文件大小超出限制。';
        } else {
            statusCode = 400;
            errors = error.message;
        }
    }

    res.status(statusCode).json({
        status: false,
        message: `请求失败: ${error.name}`,
        errors: Array.isArray(errors) ? errors : [errors],
    });
    // res.write(); // 不会处理数据 可以写多次 不会结束请求需要搭配end 支持参数类型：Buffer | String
    // res.end(); // 不会处理数据 只能写一次 可以结束请求 Buffer | String
    // res.send(); // 会处理数据添加对应content-type 只能写一次 可以结束请求 支持参数类型：Buffer | String | Object | Array
    // res.json(); // 会处理数据 添加application/json content-type 只能写一次 可以结束请求 支持参数类型：任何json类型

    logger(req, error, statusCode, errors);
}

module.exports = {
    success,
    failure,
};
