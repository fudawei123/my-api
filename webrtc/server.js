const app = require('express')();
const wsInstance = require('express-ws')(app);

const cors = require('cors');
app.use(cors({ origin: 'http://127.0.0.1:3000' }));

app.ws('/', (ws) => {
    ws.on('message', (data) => {
        wsInstance.getWss().clients.forEach((server) => {
            if (server !== ws) {
                server.send(data);
                console.log(JSON.parse(data).type);
            }
        });
    });
});

app.listen(8099, '0.0.0.0');
