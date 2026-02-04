const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// 维护所有连接的客户端：key=ws连接实例，value={role: 角色(host/client), id: 唯一标识}
const clients = new Map();
let clientId = 1; // 自增唯一ID，用于区分客户端

console.log('信令服务器启动成功，监听端口：8080');

// 监听新客户端连接
wss.on('connection', (ws) => {
  const id = clientId++;
  const clientInfo = { role: null, id };
  clients.set(ws, clientInfo);
  console.log(`客户端${id}已连接，当前在线数：${clients.size}`);

  // 监听客户端发送的消息
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      const currentClient = clients.get(ws);
      handleClientMessage(ws, currentClient, msg);
    } catch (err) {
      console.error('解析客户端消息失败：', err);
    }
  });

  // 监听客户端断开连接
  ws.on('close', () => {
    const { role, id } = clients.get(ws);
    clients.delete(ws);
    console.log(`客户端${id}（${role || '未分配角色'}）已断开，当前在线数：${clients.size}`);
    // 可选：通知其他客户端该节点断开（本示例简化，暂不实现）
  });

  // 监听连接错误
  ws.on('error', (err) => {
    const { id } = clients.get(ws);
    console.error(`客户端${id}连接错误：`, err);
  });
});

/**
 * 处理客户端发送的消息
 * @param {WebSocket} ws 客户端连接实例
 * @param {Object} currentClient 当前客户端信息（role, id）
 * @param {Object} msg 客户端消息
 */
function handleClientMessage(ws, currentClient, msg) {
  const { type } = msg;
  console.log(`收到客户端${currentClient.id}消息：`, msg);

  switch (type) {
    // 发送方注册（仅发送方可触发）
    case 'register-host':
      currentClient.role = 'host';
      ws.send(JSON.stringify({ type: 'host-registered', msg: '已成功注册为发送方', hostId: currentClient.id }));
      console.log(`客户端${currentClient.id}注册为发送方`);
      break;

    // 接收方注册（仅接收方可触发）
    case 'register-client':
      currentClient.role = 'client';
      // 查找当前在线的发送方（本示例仅支持1个发送方，可扩展多发送方）
      const host = Array.from(clients.entries()).find(([_, c]) => c.role === 'host');
      if (host) {
        const [hostWs, hostInfo] = host;
        // 通知接收方：找到发送方，携带发送方ID
        ws.send(JSON.stringify({
          type: 'host-found',
          hostId: hostInfo.id,
          clientId: currentClient.id
        }));
        // 通知发送方：有新接收方接入，携带接收方ID
        hostWs.send(JSON.stringify({
          type: 'new-client-join',
          clientId: currentClient.id,
          hostId: hostInfo.id
        }));
      } else {
        ws.send(JSON.stringify({ type: 'error', msg: '暂无可用发送方，请先启动发送方并完成注册' }));
      }
      break;

    // 转发SDP Offer（发送方→接收方）
    case 'offer':
      forwardMessage(msg.targetId, ws, msg);
      break;

    // 转发SDP Answer（接收方→发送方）
    case 'answer':
      forwardMessage(msg.targetId, ws, msg);
      break;

    // 转发ICE候选（双向转发）
    case 'ice-candidate':
      forwardMessage(msg.targetId, ws, msg);
      break;

    default:
      ws.send(JSON.stringify({ type: 'error', msg: '未知消息类型' }));
  }
}

/**
 * 转发消息给目标客户端
 * @param {number} targetId 目标客户端ID
 * @param {WebSocket} senderWs 发送方连接实例
 * @param {Object} msg 要转发的消息
 */
function forwardMessage(targetId, senderWs, msg) {
  const target = Array.from(clients.entries()).find(([_, c]) => c.id === targetId);
  if (target) {
    const [targetWs] = target;
    // 补充发送方ID，方便目标方识别
    targetWs.send(JSON.stringify({ ...msg, senderId: clients.get(senderWs).id }));
  } else {
    senderWs.send(JSON.stringify({ type: 'error', msg: `目标客户端${targetId}未在线` }));
  }
}
