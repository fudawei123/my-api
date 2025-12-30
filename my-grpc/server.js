const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// 加载 proto 文件
const protoPath = path.join(__dirname, 'hello.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const helloProto = grpc.loadPackageDefinition(packageDefinition).hello;

const userProtoPath = path.join(__dirname, 'user.proto');
const userPackageDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const userProto = grpc.loadPackageDefinition(userPackageDefinition).user;
// 创建客户端连接
const userClient = new userProto.UserService(
  '192.168.50.66:50052', // Server user 的地址
  grpc.credentials.createInsecure()
);


// 实现服务方法
const sayHello = (call, callback) => {
  const name = call.request.name;
  userClient.getUsernameByUserid({ userid: name }, (err, response) => {
    if (!response.success) {
      callback(null, { message: response.message });
      return;
    }
    callback(null, { message: `Hello ${response.username}! This is Server A` });
  });
};

// 启动服务
const server = new grpc.Server();
server.addService(helloProto.Greeter.service, { SayHello: sayHello });
const port = '0.0.0.0:50051';
server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) throw err;
  // server.start();
  console.log(`Server A running on ${port}`);
});