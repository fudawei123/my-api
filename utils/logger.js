const path = require("path");
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const {Log} = require("../models");

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
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: path.join(logDirectory, "application-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

module.exports = async (  req, error, statusCode, errors ) => {
  try {
    const log = {
      statusCode,
      url: req.originalUrl,
      body: JSON.stringify(req.body),
      errors: JSON.stringify(errors),
      stack: error.stack,
      message: error.name
    }
    logger.error(log);
    await Log.create(log);
  } catch (error) {
    console.error(error)
  }
};
