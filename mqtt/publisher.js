const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

// 1. 配置AWS IoT Core连接参数
const config = {
  // 替换为你的AWS IoT Core MQTT Broker端点（与订阅端一致）
  broker: 'a2hvi8bfzv3o7l-ats.iot.eu-north-1.amazonaws.com',
  port: 8883,
  // 客户端ID需唯一，与订阅端区分
  clientId: 'local-mqtt-publisher-001',
  // 证书路径（与订阅端使用相同的证书文件，同一Thing可多个客户端连接）
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
  rejectUnauthorized: true
});

// 4. 连接成功后，向指定主题发布消息
client.on('connect', () => {
  console.log('✅ 发布端已成功连接到AWS IoT Core MQTT Broker');

  // 发布消息的主题（与订阅端订阅的主题一致：`local/msg/test`）
  const topic = 'local/msg/test';

  // 构造测试消息（可自定义内容）
  const message = {
    content: 'Hello from 本地MQTT发布端',
    sender: 'local-mqtt-publisher-001',
    sendTime: new Date().toLocaleString()
  };

  // 发布消息（第二个参数为消息体，需转为字符串）
  client.publish(topic, JSON.stringify(message), (err) => {
    if (!err) {
      console.log(`✅ 消息已成功发布到主题 [${topic}]`);
      console.log(`   发布内容：${JSON.stringify(message, null, 2)}`);
    } else {
      console.error('❌ 消息发布失败：', err);
    }

    // 发布完成后关闭连接（如需持续发布，可移除该行，定时发送消息）
    client.end();
  });
});

// 5. 错误处理回调
client.on('error', (err) => {
  console.error('❌ 发布端连接/运行错误：', err);
  client.end();
});