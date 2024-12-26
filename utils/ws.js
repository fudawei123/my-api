const WebSocket = require('ws');

// 保存所有连接的客户端
const clients = new Map();

// 定义一个函数，用于向所有客户端发送消息
function broadcast(userId, message) {
    const client = clients.get(userId + '');
    if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
    }
}

let wss;
module.exports = {
    broadcast,
    wss,
    createWebSocketServer(server) {
        wss = new WebSocket.Server({ server });

        // WebSocket连接事件
        wss.on('connection', (ws, req) => {
            console.log('Client connected');

            // 假设用户ID存储在请求的查询参数中
            const userId = req.url.split('=')[1];

            // 输出用户ID
            console.log('User ID:', userId);

            // 将客户端添加到集合中
            clients.set(userId, ws);

            ws.on('message', (message) => {
                console.log(`Received: ${message}`);
                // 广播消息给所有客户端
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });
    },
};
