const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const { grpc: authGrpc } = require('../routes/app/auth');

const packageDefinition = protoLoader.loadSync(__dirname + '/auth.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

function main() {
    const server = new grpc.Server();
    server.addService(authProto.Auth.service, { ...authGrpc });
    server.bindAsync(
        '0.0.0.0:50051',
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('绑定失败:', error);
                return;
            }
            console.log(`gRPC 服务器在端口 ${port} 启动`);
        }
    );
}
main();
