// 引入 mqtt 库
const mqtt = require('mqtt');

// 1. 配置连接参数
const options = {
  // 连接地址（公共测试服务器）
  host: 'test.mosquitto.org',
  port: 1883,
  // 客户端ID（自定义，建议唯一）
  clientId: `nodejs_mqtt_${Math.random().toString(16).substr(2, 8)}`,
  // 可选：若服务器需要认证，添加以下配置
  // username: 'your_username',
  // password: 'your_password',
  // 心跳间隔（秒），默认 60s
  keepalive: 60,
  // 自动重连
  reconnectPeriod: 1000
};

// 2. 连接 MQTT 服务器
const client = mqtt.connect(options);

// 3. 监听连接成功事件
client.on('connect', () => {
  console.log('✅ 成功连接到 MQTT 服务器');

  // 订阅主题（可订阅多个，用数组）
  const topic = 'device_topic';
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log(`✅ 已订阅主题：${topic}`);

      // 发布消息到该主题
      const message = {
        deviceId: 'sensor_001',
        timestamp: new Date().toISOString()
      };
      // 发布消息（主题，消息内容（需转字符串），QoS 等级）
      client.publish('server_topic', JSON.stringify(message), { qos: 1 }, (err) => {
        if (err) {
          console.error('❌ 发布消息失败：', err);
        } else {
          console.log('📤 发布消息：', message);
        }
      });
    }
  });
});

// 4. 监听接收消息事件（订阅的主题有消息时触发）
client.on('message', (topic, payload) => {
  // payload 是 Buffer 类型，需转字符串再解析
  const message = JSON.parse(payload.toString());
  console.log(`📥 收到主题 [${topic}] 的消息：`, message);
});

// 5. 监听错误事件
client.on('error', (err) => {
  console.error('❌ MQTT 连接错误：', err);
  client.end(); // 出错时关闭连接
});

// 6. 监听断线事件
client.on('close', () => {
  console.log('🔌 MQTT 连接已关闭，正在尝试重连...');
});

// 7. 监听重连事件
client.on('reconnect', () => {
  console.log('🔄 正在重连 MQTT 服务器...');
});