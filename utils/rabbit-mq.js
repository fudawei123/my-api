const sendMail = require('./mail');
const amqp = require('amqplib');
const { Log } = require('../models');

let connection = null;
const connectToRabbitMQ = async () => {
    if (connection) return;
    connection = await amqp.connect(process.env.RABBITMQ_URL);
};

class MQ {
    channel = null;
    queueName = null;
    constructor(queueName) {
        this.queueName = queueName;
    }
    async connectToRabbitMQ() {
        try {
            await connectToRabbitMQ();
            if (this.channel) return;
            this.channel = await connection.createChannel();
            await this.channel.assertQueue(this.queueName, { durable: true });
        } catch (error) {
            console.error('RabbitMQ 连接失败：', error);
        }
    }
    async producer(msg) {
        try {
            await this.connectToRabbitMQ();
            this.channel.sendToQueue(
                this.queueName,
                Buffer.from(JSON.stringify(msg)),
                { persistent: true }
            );
        } catch (error) {
            console.error(`${this.queueName}生产者错误：`, error);
        }
    }
    async consumer(cb) {
        try {
            await this.connectToRabbitMQ();
            this.channel.consume(
                this.queueName,
                (msg) => {
                    const message = JSON.parse(msg.content.toString());
                    cb(message);
                },
                {
                    noAck: true,
                }
            );
        } catch (error) {
            console.error(`${this.queueName}消费者错误：`, error);
        }
    }
}

class EmailMQ extends MQ {
    constructor(queueName) {
        super(queueName);
    }

    producer(msg) {
        super.producer(msg);
    }
    consumer() {
        super.consumer(async (msg) => {
            await sendMail(msg.to, msg.subject, msg.html);
        });
    }
}

class LogMQ extends MQ {
    constructor(queueName) {
        super(queueName);
    }

    producer(msg) {
        super.producer(msg);
    }
    consumer() {
        super.consumer(async (msg) => {
            await Log.create(msg);
        });
    }
}

module.exports = {
    emailMQ: new EmailMQ('email_queue'),
    logMQ: new LogMQ('log_queue'),
};
