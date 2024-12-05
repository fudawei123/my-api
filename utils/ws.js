const WebSocket = require("ws");

// 保存所有连接的客户端
const clients = new Set();

// 定义一个函数，用于向所有客户端发送消息
function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// 模拟定时发送消息
// setInterval(() => {
//   const currentTime = new Date().toLocaleTimeString();
//   broadcast(`Server time: ${currentTime}`);
// }, 5000);

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  // WebSocket连接事件
  wss.on("connection", (ws) => {
    console.log("Client connected");

    // 将客户端添加到集合中
    clients.add(ws);

    ws.on("message", (message) => {
      console.log(`Received: ${message}`);
      // 广播消息给所有客户端
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
};
