const { parentPort } = require('worker_threads');

const sleep = (milliseconds) => {
    const start = Date.now();
    while (Date.now() - start < milliseconds) {
        // 什么也不做，只是等待
    }
};

// 接收来自主线程的消息
parentPort.on('message', (milliseconds) => {
    sleep(milliseconds);

    // 向主线程发送消息
    parentPort.postMessage('done');
});
