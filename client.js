const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync(__dirname + '/grpc/auth.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const client = new authProto.Auth(
    '0.0.0.0:50051',
    grpc.credentials.createInsecure()
);

const request = {
    login: '542617386@qq.com',
    password: '123456',
};
client.signIn(request, (err, response) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Response:', response);
    }
});
