/**
 * 自定义 400 错误类
 */
class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequest";
  }
}

/**
 * 自定义 401 错误类
 */
class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.name = "Unauthorized";
  }
}

/**
 * 自定义 404 错误类
 */
class NotFound extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFound";
  }
}

module.exports = {
  BadRequest,
  Unauthorized,
  NotFound,
};
