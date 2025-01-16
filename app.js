const cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./grpc/server');
require('dotenv').config();

const { emailMQ, logMQ } = require('./utils/rabbit-mq');
emailMQ.consumer();
logMQ.consumer();

const syncReadCountJob = require('./utils/syncReadCount');
syncReadCountJob.start();

const appRouter = require('./routes');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS 跨域配置
app.use(cors());
// const corsOptions = {
//   origin: "https://clwy.cn",
// };
// const corsOptions = {
//   origin: ["https://clwy.cn", "http://127.0.0.1:5500"],
// };
// app.use(cors(corsOptions));

app.use('/', appRouter);

module.exports = app;
