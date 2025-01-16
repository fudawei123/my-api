const TaskScheduler = require('./TaskScheduler');
const { Course } = require('../models');
const { getKeysByPattern, getKey } = require('./redis');

const task = async () => {
    const keys = await getKeysByPattern('courseCount:*');
    keys.forEach(async (key) => {
        const readCount = await getKey(key);
        const courseId = key.split(':')[1];
        Course.update({ readCount: readCount }, { where: { id: courseId } });
    });
};

module.exports = new TaskScheduler('30 1 1 * * *', task);
