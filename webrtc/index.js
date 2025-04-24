const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// WebSocket 服务器逻辑
wss.on('connection', (ws) => {
    console.log('Client connected');

    // 当收到来自客户端的信令数据时，转发给摄像头设备
    ws.on('message', (message) => {
        // 将信令数据转发到摄像头设备
        cameraDevice.handleSignalData(message);
    });

    // 当摄像头设备生成信令数据时，发送给客户端
    cameraDevice.setSignalDataHandler((data) => {
        ws.send(data);
    });

    // 当 WebSocket 连接关闭时，可以进行清理操作
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
// 摄像头设备对象
const cameraDevice = {
    peerConnection: null,

    // 初始化 RTCPeerConnection 对象
    initPeerConnection() {
        this.peerConnection = new RTCPeerConnection();

        // 当 ICE 候选者准备好时，发送给客户端
        this.peerConnection.onicecandidate = ({ candidate }) => {
            if (candidate) {
                this.sendSignalData({ type: 'candidate', candidate });
            }
        };

        // 当接收到远程流时，处理并显示在 video 元素中
        this.peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            this.onRemoteStream(remoteStream);
        };
    },

    // 处理信令数据
    async handleSignalData(data) {
        if (typeof data === 'string') {
            data = JSON.parse(data); // 解析 JSON 字符串
        }

        switch (data.type) {
            case 'offer':
                await this.handleOffer(data.offer);
                break;
            case 'answer':
                await this.handleAnswer(data.answer);
                break;
            case 'candidate':
                await this.handleCandidate(data.candidate);
                break;
            default:
                console.error('Unknown signal data type:', data.type);
        }
    },

    // 处理 offer 信令数据
    async handleOffer(offer) {
        if (!this.peerConnection) {
            this.initPeerConnection();
        }

        await this.peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
        );
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.sendSignalData({ type: 'answer', answer });
    },

    // 处理 answer 信令数据
    async handleAnswer(answer) {
        if (this.peerConnection) {
            await this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
        }
    },

    // 处理 ICE 候选者
    async handleCandidate(candidate) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
            );
        }
    },

    // 发送信令数据到客户端
    sendSignalData(data) {
        if (this.onSignalData) {
            this.onSignalData(JSON.stringify(data)); // 转换为 JSON 字符串
        } else {
            console.error('No handler for sending signal data.');
        }
    },

    // 当远程流可用时调用此函数
    onRemoteStream(remoteStream) {
        // 处理远程流的逻辑，例如显示在视频元素中
        console.log('Received remote stream:', remoteStream);
    },

    // 设置信令数据处理函数
    setSignalDataHandler(handler) {
        this.onSignalData = handler;
    },
};
