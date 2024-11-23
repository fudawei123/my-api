const { incrExpire } = require('../utils/redis')

module.exports = async (req, res, next) => {
    const key = `ip${req.ip}`
    const limit = 100
    const expire = 10
    const [count] = await incrExpire(key, expire)
    if (count > limit) {
        const msg = 'Too many requests'
        console.log(msg, count)
        return res.status(429).send(msg)
    }
    next()
}