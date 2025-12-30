const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const express = require('express');

// 加载相同的 proto 文件
const protoPath = path.join(__dirname, 'hello.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const helloProto = grpc.loadPackageDefinition(packageDefinition).hello;

// 创建客户端连接
const client = new helloProto.Greeter(
  '192.168.50.66:50051', // Server A 的地址
  grpc.credentials.createInsecure()
);

const app = express();
const port = process.env.PORT || 3001;
app.get('/api/greet', (req, res) => {
  // 解析请求参数
  const name = req.query.name;
  // 调用 gRPC 方法
  client.sayHello({ name }, (err, response) => {
    res.json({
      message: response.message,
      timestamp: new Date().toLocaleString()
    });
  });
});
app.listen(port, () => {
  console.log(`服务器已启动，正在监听端口 ${port}...`);
});