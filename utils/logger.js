const path = require("path");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const { logMQ } = require("./rabbit-mq");

// 日志目录路径
const logDirectory = path.join(__dirname, "../logs");

// 配置 winston
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // 终端中输出彩色的日志信息
                winston.format.simple()
            ),
        }),
        new DailyRotateFile({
            filename: path.join(logDirectory, "application-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        }),
    ],
});

module.exports = async (req, error, statusCode, errors) => {
    try {
        const log = {
            statusCode,
            url: req?.originalUrl || null,
            body: req ? JSON.stringify(req.body) : null,
            errors: JSON.stringify(errors),
            stack: error.stack,
            message: error.name,
        };
        logger.error("错误日志", log);
        logMQ.producer(log);
    } catch (error) {
        console.error(error);
    }
};
