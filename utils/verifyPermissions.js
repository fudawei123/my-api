const { Unauthorized } = require('http-errors');

const verifyOperate = (data, userId) => {
    if (userId !== data.userId) {
        throw new Unauthorized('没有权限。');
    }
};

module.exports = {
    verifyOperate,
};
