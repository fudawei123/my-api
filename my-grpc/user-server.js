const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// 1. 加载并解析 user.proto 文件
const protoPath = path.join(__dirname, 'user.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true, // 保持 proto 中的字段名大小写（不自动转驼峰）
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
// 加载包定义，获取 user 服务对象
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// 2. 模拟用户数据库（实际项目可替换为真实数据库查询：MySQL、MongoDB 等）
const mockUserDB = [
  { userid: '1001', username: 'ZhangSan' },
  { userid: '1002', username: 'LiSi' },
  { userid: '1003', username: 'WangWu' },
  { userid: '1004', username: 'ZhaoLiu' }
];

// 3. 实现 RPC 方法：根据 userid 查询 username
const getUsernameByUserid = (call, callback) => {
  console.log('收到 RPC 请求：', call.request);
  // 从请求中获取传入的 userid
  const reqUserid = call.request.userid;

  // 校验 userid 是否为空
  if (!reqUserid) {
    return callback(null, {
      username: '',
      success: false,
      message: '错误：userid 不能为空'
    });
  }

  // 从模拟数据库中查询用户
  const targetUser = mockUserDB.find(user => user.userid === reqUserid);

  // 构造响应结果
  if (targetUser) {
    callback(null, {
      username: targetUser.username,
      success: true,
      message: '查询成功'
    });
  } else {
    callback(null, {
      username: '',
      success: false,
      message: `错误：未找到 userid 为 ${reqUserid} 的用户`
    });
  }
};

// 4. 启动 gRPC 服务
const startGrpcServer = () => {
  const server = new grpc.Server();

  // 注册 UserService 服务，并绑定实现的方法
  server.addService(userProto.UserService.service, {
    GetUsernameByUserid: getUsernameByUserid
  });

  // 监听端口（0.0.0.0 允许外部网络访问，50052 为自定义端口）
  const serverAddress = '0.0.0.0:50052';
  const serverCredentials = grpc.ServerCredentials.createInsecure(); // 测试环境不加密，生产环境用 TLS

  // 绑定端口并启动服务
  server.bindAsync(serverAddress, serverCredentials, (err, port) => {
    if (err) {
      console.error('gRPC 服务启动失败：', err);
      return;
    }
    // server.start();
    console.log(`gRPC 用户服务已启动，监听地址：${serverAddress}`);
  });
};

// 调用启动函数
startGrpcServer();