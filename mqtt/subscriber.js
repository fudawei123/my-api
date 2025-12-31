const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// 1. 配置AWS IoT Core连接参数
const config = {
  // 替换为你的AWS IoT Core MQTT Broker端点
  broker: 'a2hvi8bfzv3o7l-ats.iot.eu-north-1.amazonaws.com',
  // MQTT端口（8883为SSL加密端口，AWS IoT Core仅支持该端口用于证书认证）
  port: 8883,
  // 替换为你的事物名称（或任意客户端ID，需唯一）
  clientId: 'local-mqtt-subscriber-001',
  // 证书路径配置
  cert: fs.readFileSync(path.join(__dirname, './aws-iot-certs/8ccb517329fa661860935a1ebd7e6f13454939a527cab57279ca119c8883da38-certificate.pem.crt')),
  key: fs.readFileSync(path.join(__dirname, './aws-iot-certs/8ccb517329fa661860935a1ebd7e6f13454939a527cab57279ca119c8883da38-private.pem.key')),
  ca: fs.readFileSync(path.join(__dirname, './aws-iot-certs/AmazonRootCA1.pem'))
};

// 2. 构建MQTT连接URL
const mqttUrl = `mqtts://${config.broker}:${config.port}`;

// 3. 连接到AWS IoT Core MQTT Broker
const client = mqtt.connect(mqttUrl, {
  clientId: config.clientId,
  cert: config.cert,
  key: config.key,
  ca: config.ca,
  rejectUnauthorized: true // 启用SSL证书验证
});

// 4. 连接成功回调
client.on('connect', () => {
  console.log('✅ 订阅端已成功连接到AWS IoT Core MQTT Broker');

  // 订阅指定MQTT主题（如`local/msg/test`，发布端将向该主题发送消息）
  const topic = 'local/msg/test';
  client.subscribe(topic, (err) => {
    if (!err) {
      console.log(`✅ 已成功订阅主题：${topic}`);
      console.log('🔍 等待接收消息...\n');
    } else {
      console.error('❌ 订阅主题失败：', err);
    }
  });
});

// 5. 接收消息回调（当有消息发布到订阅的主题时，触发该回调）
client.on('message', (topic, payload) => {
  console.log(`📩 收到来自主题 [${topic}] 的消息：`);
  console.log(`   原始内容：${payload.toString()}`);
  console.log(`   接收时间：${new Date().toLocaleString()}\n`);

  // 新增：定义发布给Lambda的MQTT主题（单独划分，方便IoT Core规则筛选）
  const lambdaTopic = 'local/msg/lambda';
  // 新增逻辑：连接成功后，向`local/msg/lambda`主题发布一条测试消息（触发Lambda）
  const lambdaMessage = {
    content: 'Hello from 本地订阅端（发送给Lambda）',
    sender: config.clientId,
    sendTime: new Date().toLocaleString()
  };
  client.publish(lambdaTopic, JSON.stringify(lambdaMessage), (err) => {
    if (!err) {
      console.log(`✅ 订阅端已成功向Lambda主题 [${lambdaTopic}] 发布消息`);
      console.log(`   发布内容：${JSON.stringify(lambdaMessage, null, 2)}\n`);
    } else {
      console.error('❌ 订阅端发布Lambda消息失败：', err);
    }
  });
});

// 6. 错误处理回调
client.on('error', (err) => {
  console.error('❌ 订阅端连接/运行错误：', err);
  client.end(); // 出错时关闭连接
});